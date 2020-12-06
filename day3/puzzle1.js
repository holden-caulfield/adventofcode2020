const readline = require("readline")
const fs = require("fs")
const R = require("ramda")

const FILE = "./data.txt"

const slopes = [
  { right: 1, down: 1 },
  { right: 3, down: 1 },
  { right: 5, down: 1 },
  { right: 7, down: 1 },
  { right: 1, down: 2 }
]

const evaluateSlope = ({ right, down }) =>
  new Promise((res, rej) => {
    const readInterface = readline.createInterface({
      input: fs.createReadStream(FILE),
      console: false
    })

    let cursor = 0,
      trees = 0,
      lineCount = 0

    readInterface.on("line", (line) => {
      if (lineCount % down === 0) {
        if (line.charAt(cursor) === "#") {
          trees = trees + 1
        }
        cursor = (cursor + right) % line.length
      }
      lineCount = lineCount + 1
    })

    readInterface.on("close", () => {
      console.log(`For slope Right: ${right}, Down: ${down}`)
      console.log(`Total trees: ${trees}`)
      res(trees)
    })
  })

Promise.all(slopes.map(evaluateSlope)).then((results) => {
  console.log(`Product of all results: ${R.product(results)}`)
})
