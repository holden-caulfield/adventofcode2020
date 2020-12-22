const R = require("ramda")
const fs = require("fs")

FILE = "./data.txt"

const reduceIndexed = R.addIndex(R.reduce)

const parseDeck = R.pipe(R.split(/\n/), R.map(parseInt))

const makeDecksHash = ([deck1, deck2]) =>
  `${deck1.join(",")}|${deck2.join(",")}`

const getWinner = ([deck1, deck2]) => {
  if (deck2.length === 0) return [deck1, 1]
  if (deck1.length === 0) return [deck2, 2]
  return false
}

const playRound = ([deck1, deck2], recursive = false) => {
  const [card1, ...rest1] = deck1,
    [card2, ...rest2] = deck2
  let winnerPlayer

  if (recursive && card1 <= rest1.length && card2 <= rest2.length) {
    winnerPlayer = R.last(
      playCombat([R.take(card1, rest1), R.take(card2, rest2)], true)
    )
  } else {
    winnerPlayer = card1 > card2 ? 1 : 2
  }
  if (winnerPlayer === 1) {
    return [[...rest1, card1, card2], rest2]
  } else {
    return [rest1, [...rest2, card2, card1]]
  }
}

const calculateScore = R.pipe(
  R.head,
  R.reverse,
  reduceIndexed((total, value, index) => total + value * (index + 1), 0)
)

const playCombat = (decks, recursive = false) => {
  let winner = false,
    deckHash = "",
    history = new Set()

  while (!winner) {
    deckHash = makeDecksHash(decks)
    if (history.has(deckHash)) {
      winner = [R.head(decks), 1]
    } else {
      history.add(deckHash)
      decks = playRound(decks, recursive)
      winner = getWinner(decks)
    }
  }

  return winner
}

const cardsData = fs.readFileSync(FILE, "utf-8"),
  [__, deck1Str, deck2Str] = cardsData.match(
    /Player 1:\n([\s\S]*)\n\nPlayer 2:\n([\s\S]*)\n/m
  )
let decks = [parseDeck(deck1Str), parseDeck(deck2Str)]

const straightWinner = playCombat(decks)
console.log(
  `Winner score for straigth combat is: ${calculateScore(straightWinner)}`
)

const recursiveWinner = playCombat(decks, true)

console.log(
  `Winner score for recursive combat is: ${calculateScore(recursiveWinner)}`
)
