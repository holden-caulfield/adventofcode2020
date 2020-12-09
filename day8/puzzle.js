const { lineByLine } = require("../utils/rxFile")
const { reduce, map } = require("rxjs/operators")
const R = require("ramda")

const FILE = "./data.txt"

const instruction$ = lineByLine(FILE).pipe(
  map(R.split(" ")),
  map(([operation, argument]) => ({
    operation,
    argument: parseInt(argument)
  })),
  reduce((acc, instruction) => [...acc, instruction], [])
)

const operations = {
  nop: (state, arg) => ({ ...state, cursor: state.cursor + 1 }),
  jmp: (state, arg) => ({ ...state, cursor: state.cursor + arg }),
  acc: (state, arg) => ({
    ...state,
    cursor: state.cursor + 1,
    acc: state.acc + arg
  })
}

const flipOperation = (instructions, position) => {
  const opAtPost = instructions[position]
  switch (opAtPost.operation) {
    case "jmp":
      return R.update(position, { ...opAtPost, operation: "nop" }, instructions)
    case "nop":
      return R.update(position, { ...opAtPost, operation: "jmp" }, instructions)
    case "acc":
    default:
      return false
  }
}

const runProgram = (instructions) => {
  let state = { acc: 0, cursor: 0, history: [], exit: "NONE" }
  while (state.exit === "NONE") {
    const { operation, argument } = instructions[state.cursor]
    state.history.push({
      cursor: state.cursor,
      trace: `${state.cursor}: ${operation}(${argument})`
    })
    state = operations[operation](state, argument)
    if (R.pluck("cursor", state.history).includes(state.cursor))
      state.exit = "ERROR"
    if (state.cursor >= instructions.length) state.exit = "SUCCESS"
  }

  return state
}

const reportError = (state) => {
  const trace = R.pipe(R.pluck("trace"), R.takeLast(15))(state.history)
  console.log(`Loop detected at line ${state.cursor + 1}!`)
  console.log(`Accum is ${state.acc}`)
}

instruction$.subscribe((instructions) => {
  const firstRunState = runProgram(instructions)
  reportError(firstRunState)
  console.log("Looking for a fix")

  const positionsToTry = R.pluck("cursor", firstRunState.history)

  const tryFix = (acc, positionToTry) => {
    const newProgram = flipOperation(instructions, positionToTry)
    if (newProgram) {
      const newRunState = runProgram(newProgram)
      if (newRunState.exit === "SUCCESS") {
        console.log(`Fix found by flipping line ${positionToTry + 1}`)
        return R.reduced(newRunState)
      }
    }
    return false
  }

  const fixedRun = R.reduce(tryFix, false, positionsToTry)
  console.log(`Accumulator is ${fixedRun.acc}`)
})
