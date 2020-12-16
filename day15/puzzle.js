const seed = [0, 6, 1, 7, 2, 19, 20]
const LIMIT = 30000000

let answer

function* generateElvesNumbers() {
  let memory = new Map()
  let currentIndex = 0
  let lastNumber

  const getLastNumberOffset = () =>
    memory.has(lastNumber) ? currentIndex - memory.get(lastNumber) : 0

  while (true) {
    const nextNumber =
      currentIndex < seed.length ? seed[currentIndex] : getLastNumberOffset()

    memory.set(lastNumber, currentIndex)
    currentIndex++
    lastNumber = nextNumber

    yield nextNumber
  }
}

const elvesNumbers = generateElvesNumbers()

for (let i = 0; i < LIMIT; i++) {
  answer = elvesNumbers.next().value
}

console.log(answer)
