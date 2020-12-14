const { lineByLine } = require("../utils/rxFile")
const { map, reduce } = require("rxjs/operators")
const R = require("ramda")

const FILE = "./data.txt"

const parseInstruction = (ruleStr) => ({
  action: R.head(ruleStr),
  value: parseInt(R.tail(ruleStr))
})

const movePoint = (direction, value) => (point) => {
  switch (direction) {
    case "N":
      return { ...point, NS: point.NS + value }
    case "S":
      return { ...point, NS: point.NS - value }
    case "E":
      return { ...point, EW: point.EW + value }
    case "W":
      return { ...point, EW: point.EW - value }
    default:
      return point
  }
}

const rotate = (point, degrees) => {
  switch (degrees) {
    case 90:
      return { NS: -point.EW, EW: point.NS }
    case 180:
      return { NS: -point.NS, EW: -point.EW }
    case 270:
      return { NS: point.EW, EW: -point.NS }
    default:
      return point
  }
}

const applyWaypoint = (state, times) => ({
  NS: state.position.NS + times * state.waypoint.NS,
  EW: state.position.EW + times * state.waypoint.EW
})

const applyInstruction = (movablePoint) => (state, { action, value }) => {
  switch (action) {
    case "N":
    case "S":
    case "E":
    case "W":
      return R.evolve({ [movablePoint]: movePoint(action, value) }, state)
    case "R":
      return { ...state, waypoint: rotate(state.waypoint, value) }
    case "L":
      return { ...state, waypoint: rotate(state.waypoint, 360 - value) }
    case "F":
      return { ...state, position: applyWaypoint(state, value) }
  }
}

const manhattanDistance = ({ position }) =>
  Math.abs(position.NS) + Math.abs(position.EW)

const instruction$ = lineByLine(FILE).pipe(map(parseInstruction))

const runNavigation = (movablePoint, initialWaypoint) =>
  instruction$.pipe(
    reduce(applyInstruction(movablePoint), {
      position: { NS: 0, EW: 0 },
      waypoint: initialWaypoint
    }),
    map(manhattanDistance)
  )

const case1 = runNavigation("position", { NS: 0, EW: 1 })
const case2 = runNavigation("waypoint", { NS: 1, EW: 10 })

case1.subscribe((finalDistance) =>
  console.log(`Final manhattan distance for case 1 is ${finalDistance}`)
)

case2.subscribe((finalDistance) =>
  console.log(`Final manhattan distance for case 2 is ${finalDistance}`)
)
