const R = require("ramda")
const { lineByLine } = require("../utils/rxFile")
const { map, reduce, tap } = require("rxjs/operators")

const FILE = "./data.txt"
let USES_PRECEDENCE = false

const applyOperation = (operation, [num1, num2]) => {
  switch (operation) {
    case "+":
      return num1 + num2
    case "*":
      return num1 * num2
    default:
      throw new Error(`unknown operation ${token}`)
  }
}

const tokenizeLine = (line) => line.match(/[\d+,*,+,(,)]/g)

const shouldPopOperator = (operator, operatorsStack, usePrecedence) => {
  if (operatorsStack.length === 0) return false
  const previousOp = R.last(operatorsStack)
  if (previousOp === "(") return false
  if (usePrecedence && operator === "+" && previousOp === "*") return false
  return true
}

const infixToRpn = (usePrecedence) =>
  R.pipe(
    R.reduce(
      ([output, operators], token) => {
        switch (token) {
          case "+":
          case "*":
            const newOutput = shouldPopOperator(token, operators, usePrecedence)
              ? [...output, operators.pop()]
              : output
            return [newOutput, [...operators, token]]
          case "(":
            return [output, [...operators, token]]
          case ")":
            const [newOperators, addToOutput] = R.splitAt(
              R.lastIndexOf("(", operators),
              operators
            )
            return [
              [...output, ...R.reverse(R.tail(addToOutput))],
              newOperators
            ]
          default:
            return [[...output, parseInt(token)], operators]
        }
      },
      [[], []]
    ),
    ([output, stack]) => [...output, ...R.reverse(stack)]
  )

const evaluateRpn = R.reduce((stack, token) => {
  switch (token) {
    case "+":
    case "*":
      const [newStack, operands] = R.splitAt(-2, stack)
      return [...newStack, applyOperation(token, operands)]
    default:
      return [...stack, token]
  }
}, [])

const processLine = (usePredecence) =>
  R.pipe(tokenizeLine, infixToRpn(usePredecence), evaluateRpn, R.head)

const case1 = lineByLine(FILE).pipe(
  map(processLine(false)),
  reduce((acc, value) => acc + value, 0)
)

const case2 = lineByLine(FILE).pipe(
  map(processLine(true)),
  reduce((acc, value) => acc + value, 0)
)

case1.subscribe((result) => {
  console.log(`sum for case 1 is ${result}`)
})

case2.subscribe((result) => {
  console.log(`sum for case 2 is ${result}`)
})
