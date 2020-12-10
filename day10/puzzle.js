const data = require("./data.json")
const R = require("ramda")

const sortedAdapters = R.pipe(
  R.sort((a, b) => a - b),
  (arr) => [0, ...arr, R.last(arr) + 3]
)(data)

const countJoltageDiffs = R.pipe(
  R.aperture(2),
  R.map(([a, b]) => b - a),
  R.countBy(R.identity),
  (counts) => counts["1"] * counts["3"]
)

console.log(
  `Joltage factor for longest path: ${countJoltageDiffs(sortedAdapters)}`
)

const indexRange = R.range(0, sortedAdapters.length)

const branchesForIndex = (index) =>
  R.takeWhile(
    (nextIndex) => sortedAdapters[nextIndex] - sortedAdapters[index] <= 3,
    R.drop(index + 1, indexRange)
  )
const branchesMap = R.map(branchesForIndex, indexRange)

const combinationsForIndex = (index, accumMap) => {
  const branches = branchesMap[index]
  accumMap[index] = R.isEmpty(branches)
    ? 1
    : R.sum(R.map((index) => accumMap[index], branches))
  return accumMap
}

const combinationsMap = R.reduceRight(combinationsForIndex, [], indexRange)

console.log(`Total possible arrangements: ${R.head(combinationsMap)}`)
