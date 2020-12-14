const { lineByLine } = require("../utils/rxFile")
const { map, reduce } = require("rxjs/operators")
const R = require("ramda")

const FILE = "./data.txt"

const INITIAL_STATE = { memory: {}, mask: "" }

const chainIndexed = R.addIndex(R.chain)

const parseInstruction = (line) => {
  const [__, operation, address, argument] = line.match(
    /(\w*)\[?(\d*)?\]? = (.*)/
  )
  return { operation, address, argument }
}

const setBit = (mask, index, bit) => R.join("", R.update(index, bit, mask))

const findAllFloating = (mask) =>
  R.filter((index) => mask[index] === "X", R.range(0, mask.length))

const maskValue = (value, mask) => {
  const maskForZeroes = BigInt(parseInt(mask.replace(/X/g, "1"), 2))
  const maskForOnes = BigInt(parseInt(mask.replace(/X/g, "0"), 2))
  return (BigInt(value) | maskForOnes) & maskForZeroes
}

const expandFloatingMask = (floatingMask) =>
  R.reduce(
    (masks, index) =>
      R.chain(
        (mask) => [setBit(mask, index, 0), setBit(mask, index, 1)],
        masks
      ),
    [floatingMask.replace(/0/g, "X")],
    findAllFloating(floatingMask)
  )

const updateMemory = (state, addresses, value) => {
  for (address of addresses) {
    state.memory[address.toString()] = value
  }
}

const updateMask = (state, maskMode, argument) => {
  state.mask = maskMode === "address" ? expandFloatingMask(argument) : argument
}

const applyInstruction = (maskMode = "values") => (
  state,
  { operation, address, argument }
) => {
  switch (operation) {
    case "mask":
      updateMask(state, maskMode, argument)
      break
    case "mem":
      const addresses =
        maskMode === "address"
          ? state.mask.map((mask) => maskValue(address, mask))
          : [address]
      const value =
        maskMode === "values" ? maskValue(argument, state.mask) : argument
      updateMemory(state, addresses, value)
      break
  }
  return state
}

const runProgram = (maskMode) =>
  lineByLine(FILE).pipe(
    map(parseInstruction),
    reduce(applyInstruction(maskMode), R.clone(INITIAL_STATE)),
    map(({ memory }) => R.sum(Object.values(memory)))
  )

runProgram("values").subscribe((totalSum) =>
  console.log(`Total sum for case 1 is ${totalSum}`)
)

runProgram("address").subscribe((totalSum) =>
  console.log(`Total sum for case 2 is ${totalSum}`)
)
