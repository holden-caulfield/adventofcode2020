const { lineByLine } = require("../utils/rxFile")
const { map, reduce } = require("rxjs/operators")
const R = require("ramda")
const FILE = "./data.txt"

const map$ = lineByLine(FILE).pipe(
  map(R.split("")),
  reduce((map, row) => [...map, row], [])
)

const getAdjacents = (map, row, column) => {
  const rowIndexes = R.range(
      Math.max(row - 1, 0),
      Math.min(row + 2, map.length)
    ),
    columnIndexes = R.range(
      Math.max(column - 1, 0),
      Math.min(column + 2, R.head(map).length)
    )
  return R.without([[row, column]], R.xprod(rowIndexes, columnIndexes))
}

const getFirstSeeables = (map, row, column) => {
  const rows = map.length,
    columns = R.head(map).length,
    inRange = ([row, column]) =>
      row >= 0 && row < rows && column >= 0 && column < columns,
    moves = [-1, 0, 1],
    directions = R.without([[0, 0]], R.xprod(moves, moves)),
    step = R.zipWith(R.add),
    findOnDirection = (direction) => {
      let cursor = step(direction, [row, column])
      while (inRange(cursor)) {
        const [nextRow, nextColumn] = cursor
        if (map[nextRow][nextColumn] != ".") return cursor
        cursor = step(direction, cursor)
      }
      return false
    }
  return R.pipe(R.map(findOnDirection), R.filter(Boolean))(directions)
}

const applyRulesToSeat = (relevantSeatsMap, occupiedLimit) => (
  map,
  row,
  column
) => {
  const currentValue = map[row][column]
  if (currentValue == ".") return "." //para mas placer

  const isOccupied = (map) => ([row, column]) => map[row][column] === "#"
  const relevantSeats = relevantSeatsMap[row][column]

  const countOccupied = R.filter(isOccupied(map), relevantSeats).length

  switch (currentValue) {
    case "L":
      return countOccupied == 0 ? "#" : "L"
    case "#":
      return countOccupied >= occupiedLimit ? "L" : "#"
    default:
      throw new Exception(`Unrecognizable seat ${currentValue}`)
  }
}

const applyToMap = (transform) => (map) => {
  const numRows = map.length,
    numColumns = R.head(map).length,
    rowsRange = R.range(0, numRows),
    columnsRange = R.range(0, numColumns),
    seatIndexes = R.splitEvery(numColumns, R.xprod(rowsRange, columnsRange)),
    applyTransform = ([row, column]) => transform(map, row, column)

  return R.map(R.map(applyTransform), seatIndexes)
}

const runSeatSimulation = (map, relevantSeatsMap, occupiedLimit) => {
  const applyRulesToMap = applyToMap(
    applyRulesToSeat(relevantSeatsMap, occupiedLimit)
  )
  let currentMap = map,
    newMap = applyRulesToMap(currentMap)

  while (!R.equals(currentMap, newMap)) {
    currentMap = newMap
    newMap = applyRulesToMap(currentMap)
  }

  const finalSeatCount = R.pipe(
    R.flatten,
    R.filter(R.equals("#")),
    R.length
  )(currentMap)

  console.log(`Final occupied seat count: ${finalSeatCount}`)
}

map$.subscribe((map) => {
  const adjacentsMap = applyToMap(getAdjacents)(map)
  runSeatSimulation(map, adjacentsMap, 4)

  const seeableMap = applyToMap(getFirstSeeables)(map)
  runSeatSimulation(map, seeableMap, 5)
})
