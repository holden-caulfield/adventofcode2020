const [timestamp, buses] = require("./data.json")
const R = require("ramda")

const bestBus = R.pipe(
  R.filter((value) => value !== "x"),
  R.map((busID) => ({
    busID,
    wait: Math.ceil(timestamp / busID) * busID - timestamp
  })),
  R.reduce(R.minBy(R.prop("wait")), { wait: Infinity })
)(buses)

console.log("Best bus for case 1")
console.log(bestBus)
console.log(`for a factor of: ${bestBus.busID * bestBus.wait}`)

const gcd = (a, b) => {
  const [big, small] = R.sort(R.difference, [a, b])
  const remainder = big % small
  return remainder === 0 ? small : gcd(small, remainder)
}

const lcm = (a, b) => (a * b) / gcd(a, b)

const reduceIndexed = R.addIndex(R.reduce)

const magicTimestamp = reduceIndexed(
  ({ timestamp, step }, value, index) => {
    if (value === "x") return { timestamp, step }

    let newTimestamp = timestamp
    while ((newTimestamp + index) % value !== 0) {
      newTimestamp = newTimestamp + step
    }

    return {
      timestamp: newTimestamp,
      step: step === 0 ? value : lcm(step, value)
    }
  },
  { timestamp: 0, step: 0 }
)

console.log(`Magic timestamp for case 2 is: ${magicTimestamp(buses).timestamp}`)
