const data = require("./data.json")
const R = require("ramda")

const numCompare = (a, b) => a - b

const sortedData = R.groupBy((n) => n % 10, R.sort(numCompare, data))

const permutations = R.compose(R.sequence(R.of), R.flip(R.repeat))

const validPermutations = permutations(3, R.range(0, 9)).filter(
  (nums) => R.sum(nums) % 10 === 0
)

const evaluatePermutations = (permutations) => {
  let groups = permutations.map((group) => sortedData[group])
  let sum = 0
  while (sum < 2020) {
    const nums = groups.map(R.head)
    const difs = groups.map((group) => group[1] - group[0])
    const next = R.indexOf(R.apply(Math.min, difs), difs)
    sum = R.sum(nums)
    if (sum === 2020) {
      console.log(nums)
      console.log(R.sum(nums))
      console.log(R.product(nums))
    }
    groups = R.update(next, R.tail(groups[next]), groups)
  }
}

R.forEach(evaluatePermutations, validPermutations)
