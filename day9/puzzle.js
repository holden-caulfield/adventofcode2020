const R = require("ramda")
const data = require("./data.json")

const PREAMBLE_LENGTH = 25

const sortDescending = R.sort((a, b) => b - a)

const prepareSets = R.pipe(
  R.aperture(PREAMBLE_LENGTH + 1),
  R.map(R.reverse),
  R.map(([target, ...lookupSet]) => ({
    target,
    lookupSet: sortDescending(lookupSet)
  }))
)

const findSumNumbers = ({ target, lookupSet }) =>
  R.reduce(
    (rest, num) => {
      for (let other of R.reverse(rest)) {
        const sum = other + num
        if (sum === target) return R.reduced([num, other])
        if (sum > target) break
      }
      return R.tail(rest)
    },
    R.tail(lookupSet),
    R.init(lookupSet)
  )

const findWeakSet = (data, target) => {
  let sum = 0,
    members = []
  for (let member of data) {
    sum += member
    members.push(member)
    if (sum === target) return members
    if (sum > target) return findWeakSet(R.tail(data), target)
  }
  return false
}

const invalidCase = R.find(
  (set) => R.isEmpty(findSumNumbers(set)),
  prepareSets(data)
)

const { target } = invalidCase
console.log(`Invalid number is: ${target}`)

const weakSetSorted = sortDescending(findWeakSet(data, target))

const encryptionWeakness = R.head(weakSetSorted) + R.last(weakSetSorted)

console.log(`Encryption weakness is: ${encryptionWeakness}`)
