const { lineByLine } = require("../utils/rxFile")
const { map, reduce } = require("rxjs/operators")
const R = require("ramda")

const FILE = "./data.txt"

const getFreshInitialState = () => ({ memory: {}, mask: "" })

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

const maskAddresses = (address, floatingMask) => {
  const expandedMasks = R.reduce(
    (masks, index) =>
      R.chain(
        (mask) => [setBit(mask, index, 0), setBit(mask, index, 1)],
        masks
      ),
    [floatingMask.replace(/0/g, "X")],
    findAllFloating(floatingMask)
  )
  return expandedMasks.map((mask) => maskValue(address, mask))
}

const updateByMaskedValue = ({ memory, mask }, address, value) => {
  memory[address] = maskValue(value, mask)
  return memory
}

const updateByMaskedAddresses = ({ memory, mask }, baseAddress, value) => {
  const addresses = maskAddresses(baseAddress, mask)
  for (address of addresses) {
    memory[address.toString()] = value
  }
  return memory
}

const applyInstruction = (updateMemoryMethod) => (
  state,
  { operation, address, argument }
) => {
  switch (operation) {
    case "mask":
      return { ...state, mask: argument }
    case "mem":
      return {
        ...state,
        memory: updateMemoryMethod(state, address, argument)
      }
  }
}

const runProgram = (updateMemoryMethod) =>
  lineByLine(FILE).pipe(
    map(parseInstruction),
    reduce(applyInstruction(updateMemoryMethod), getFreshInitialState()),
    map(({ memory }) => R.sum(Object.values(memory)))
  )

runProgram(updateByMaskedValue).subscribe((totalSum) =>
  console.log(`Total sum for case 1 is ${totalSum}`)
)

runProgram(updateByMaskedAddresses).subscribe((totalSum) =>
  console.log(`Total sum for case 2 is ${totalSum}`)
)
