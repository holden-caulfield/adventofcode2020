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

const coordRange = ([x1, y1, z1], [x2, y2, z2]) =>
  R.map(
    R.flatten,
    R.xprod(
      R.xprod(R.range(x1, x2 + 1), R.range(y1, y2 + 1)),
      R.range(z1, z2 + 1)
    )
  )

const getNeighbours = ([x, y, z]) =>
  R.without(
    [[x, y, z]],
    coordRange([x - 1, y - 1, z - 1], [x + 1, y + 1, z + 1])
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
  const [[sx, ex], [sy, ey], [sz, ez]] = getBoundaries(pocketDimension)

  const newDimension = new Set(),
    coordsSet = coordRange([sx - 1, sy - 1, sz - 1], [ex + 1, ey + 1, ez + 1])

  R.forEach((coords) => {
    if (willBeActive(pocketDimension, coords)) {
      addActive(newDimension, coords)
    }
  }, coordsSet)

  return newDimension
}

const initialDimension = new Set()

for (let [x, row] of initialPocket.entries()) {
  for (let [y, value] of row.entries()) {
    if (value === "#") addActive(initialDimension, [x, y, 0])
  }
}

let currentDimension = initialDimension

R.times(() => {
  currentDimension = nextCycle(currentDimension)
}, 6)

console.log(currentDimension.size)

/// BONUS TRACK: Debugging function to render pocket dimensions

const renderDimension = (pocketDimension) => {
  const [[sx, ex], [sy, ey], [sz, ez]] = getBoundaries(pocketDimension)
  for (z of R.range(sz, ez + 1)) {
    console.log(`z = ${z}`)
    const frameView = coordRange([sx, sy, z], [ex, ey, z])
    R.pipe(
      R.map((coord) => (isActive(pocketDimension, coord) ? "#" : ".")),
      R.splitEvery(ey + 1 - sy),
      R.map(R.join("")),
      R.forEach(console.log)
    )(frameView)
  }
}
