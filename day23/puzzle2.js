const R = require("ramda")
const INITIAL_CUPS = [1, 9, 8, 7, 5, 3, 4, 6, 2]

const buildLinkedList = (seed) => {
  const LL = new Map()
  let previous = R.last(seed)
  for (number of seed) {
    LL.set(previous, number)
    previous = number
  }
  return LL
}

const getPickup = (cursor, cups) => {
  let value = cups.get(cursor),
    result = [value]
  R.times(() => {
    value = cups.get(value)
    result.push(value)
  }, 2)
  return result
}

const getTarget = (cursor, pickup, rangeLimit) => {
  const nextCandidate = (candidate) =>
    candidate === 1 ? rangeLimit : candidate - 1
  let candidate = nextCandidate(cursor)
  while (pickup.includes(candidate)) {
    candidate = nextCandidate(candidate)
  }
  return candidate
}

const move = (cursor, cups) => {
  const pickup = getPickup(cursor, cups),
    target = getTarget(cursor, pickup, cups.size),
    newCursor = cups.get(R.last(pickup))
  cups.set(cursor, newCursor)
  cups.set(R.last(pickup), cups.get(target))
  cups.set(target, R.head(pickup))
  return newCursor
}

const cupLabels = (cups) => {
  let value = cups.get(1),
    values = []
  while (value !== 1) {
    values.push(value)
    value = cups.get(value)
  }
  return values.join("")
}

const starsProduct = (cups) => {
  const star1 = cups.get(1),
    star2 = cups.get(star1)
  return star1 * star2
}

const crabGame = (moves, seed, extendTo = false) => {
  let cups = buildLinkedList(seed, extendTo),
    cursor = R.head(seed)

  R.times(() => {
    cursor = move(cursor, cups)
  }, moves)

  return cups
}

const game1 = crabGame(100, INITIAL_CUPS)
console.log(`Labels after first game: ${cupLabels(game1)}`)

const game2 = crabGame(10000000, [...INITIAL_CUPS, ...R.range(10, 1000001)])
console.log(`Product of stars after second game: ${starsProduct(game2)}`)
