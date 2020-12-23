const R = require("ramda")
const INITIAL_CUPS = [1, 9, 8, 7, 5, 3, 4, 6, 2],
  SORTED_CUPS = R.sort((a, b) => b - a, INITIAL_CUPS)

const rotateN = (n) => (list) => {
  const [bottom, top] = R.splitAt(-(n - 1), list)
  return [...top, ...bottom]
}

const getTargetFor = (value, pickup) =>
  R.pipe(rotateN(value), R.without(pickup), R.head)(SORTED_CUPS)

const splitAtTarget = (target, list) =>
  R.splitAt(R.indexOf(target, list) + 1, list)

const move = (cups) => {
  const value = R.head(cups),
    [pickup, rest] = R.splitAt(3, R.tail(cups)),
    target = getTargetFor(value, pickup),
    [restTop, restBottom] = splitAtTarget(target, rest)

  return [...restTop, ...pickup, ...restBottom, value]
}

const crabGame = (moves) => {
  let cups = INITIAL_CUPS
  R.times(() => {
    cups = move(cups)
  }, moves)
  const [bottom, [one, ...top]] = R.splitWhen(R.equals(1), cups)
  return R.join("", [...top, ...bottom])
}

const result = crabGame(100)
console.log(`Labels after cup 1, 100 moves: ${result}`)
