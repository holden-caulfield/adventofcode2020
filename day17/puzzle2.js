const initialPocket = require("./data.json")
const R = require("ramda")

const addActive = (pocketDimension, coords) =>
  pocketDimension.add(coords.join(","))

const isActive = R.curry((pocketDimension, coords) => {
  return pocketDimension.has(coords.join(","))
})

const getBoundaries = (pocketDimentsion) =>
  R.pipe(
    R.map(R.split(",")),
    R.map(R.map(parseInt)),
    R.transpose,
    R.map((values) => [Math.min(...values), Math.max(...values)])
  )([...pocketDimentsion])

const coordRange = (start, end) =>
  R.map(
    R.flatten,
    R.reduce(
      (acc, dimension) =>
        R.xprod(acc, R.range(start[dimension], end[dimension] + 1)),
      R.range(start[0], end[0] + 1),
      R.range(1, start.length)
    )
  )

const getNeighbours = (coords) =>
  R.without(
    [coords],
    coordRange(
      R.map((value) => value - 1, coords),
      R.map((value) => value + 1, coords)
    )
  )

const countActiveNeighbours = (pocketDimension) =>
  R.pipe(
    getNeighbours,
    R.map(isActive(pocketDimension)),
    R.filter(Boolean),
    R.length
  )

const willBeActive = (pocketDimension, coords) => {
  const activeCount = countActiveNeighbours(pocketDimension)(coords)
  if (isActive(pocketDimension, coords)) {
    return activeCount === 2 || activeCount === 3
  } else {
    return activeCount === 3
  }
}

const nextCycle = (pocketDimension) => {
  const newRange = R.pipe(
    R.map(([start, end]) => [start - 1, end + 1]),
    R.transpose
  )(getBoundaries(pocketDimension))

  const newDimension = new Set(),
    coordsSet = coordRange(...newRange)

  R.forEach((coords) => {
    if (willBeActive(pocketDimension, coords)) {
      addActive(newDimension, coords)
    }
  }, coordsSet)

  return newDimension
}

const runForDimensions = (dimensions, cycles) => {
  let currentDimension = new Set()

  for (let [x, row] of initialPocket.entries()) {
    for (let [y, value] of row.entries()) {
      if (value === "#")
        addActive(currentDimension, [
          x,
          y,
          ...R.times(R.always(0), dimensions - 2)
        ])
    }
  }

  R.times(() => {
    currentDimension = nextCycle(currentDimension)
  }, cycles)

  return currentDimension.size
}

console.log(
  `Active cubes for 3 dimensions, 6 cycles: ${runForDimensions(3, 6)}`
)

console.log(
  `Active cubes for 3 dimensions, 6 cycles: ${runForDimensions(4, 6)}`
)

/// BONUS TRACK: Debugging function to render pocket dimensions

const renderDimension = (pocketDimension) => {
  const [[sx, ex], [sy, ey], ...hyperDimensions] = getBoundaries(
    pocketDimension
  )

  let hyperdimRange
  if (hyperDimensions.length > 1) {
    hyperdimRange = coordRange(...R.transpose(hyperDimensions))
  } else {
    const [start, end] = R.head(hyperDimensions)
    hyperdimRange = R.map((value) => [value], R.range(start, end + 1))
  }

  for (const hyperdim of hyperdimRange) {
    const [z, w, other] = hyperdim
    console.log(`z = ${z}, ${w ? "w=" + w : ""} ${other ? other : ""}`)
    const frameView = coordRange([sx, sy, ...hyperdim], [ex, ey, ...hyperdim])
    R.pipe(
      R.map((coord) => (isActive(pocketDimension, coord) ? "#" : ".")),
      R.splitEvery(ey + 1 - sy),
      R.map(R.join("")),
      R.forEach(console.log)
    )(frameView)
  }
}
