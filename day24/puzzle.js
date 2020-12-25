const R = require("ramda")
const { lineByLine } = require("../utils/rxFile")
const {
  map,
  groupBy,
  mergeMap,
  toArray,
  filter,
  reduce
} = require("rxjs/operators")

const FILE = "./data.txt"

const directionSteps = {
  e: [0, -1],
  w: [0, 1],
  se: [-0.5, -0.5],
  sw: [-0.5, 0.5],
  ne: [0.5, -0.5],
  nw: [0.5, 0.5]
}

const parseTileSteps = (line) => R.init(line.match(/(e|se|sw|w|nw|ne)?/g))

const moveToDirection = R.curry((coord, direction) =>
  R.map(R.sum, R.zip(coord, directionSteps[direction]))
)

const applyTileDirections = R.reduce(
  (currentCoords, direction) => moveToDirection(currentCoords, direction),
  [0, 0]
)

const getNeighbours = (tile) =>
  R.map(moveToDirection(tile), Object.keys(directionSteps))

const tileHash = ([x, y]) => `${x},${y}`

const unHash = (tileStr) => R.map(parseFloat, tileStr.split(","))

const isBlack = R.curry((blackTiles, tile) => blackTiles.has(tileHash(tile)))

const countBlackNeighbours = (tile, blackTiles) =>
  R.pipe(getNeighbours, R.filter(isBlack(blackTiles)), R.length)(tile)

const willBeBlack = (blackTiles, tile) => {
  const blackNeighbours = countBlackNeighbours(tile, blackTiles)

  return isBlack(blackTiles, tile)
    ? [1, 2].includes(blackNeighbours)
    : blackNeighbours === 2
}

const cycle = (blackTiles) => {
  const newBlackTiles = new Set(),
    notBlackTiles = new Set()

  for (tile of blackTiles) {
    for (neighbour of getNeighbours(unHash(tile))) {
      const neighbourHash = tileHash(neighbour)
      if (willBeBlack(blackTiles, neighbour)) {
        newBlackTiles.add(neighbourHash)
      } else {
        notBlackTiles.add(neighbourHash)
      }
    }
  }

  return newBlackTiles
}

const blackTile$ = lineByLine(FILE).pipe(
  map(parseTileSteps),
  map(applyTileDirections),
  groupBy(([x, y]) => `${x},${y}`),
  mergeMap((group) => group.pipe(toArray())),
  filter((sameTileFlips) => sameTileFlips.length % 2 !== 0),
  reduce((allTiles, [tile, ...rest]) => [...allTiles, tile])
)

blackTile$.subscribe((blackTiles) => {
  console.log(`A total of ${blackTiles.length} tiles will be black at first`)
  let blackTilesSet = new Set(blackTiles.map(tileHash))

  R.times(() => {
    blackTilesSet = cycle(blackTilesSet)
  }, 100)

  console.log(
    `After 100 moves a total of ${blackTilesSet.size} tiles will be black`
  )
})
