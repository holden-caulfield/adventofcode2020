const seed = [0, 6, 1, 7, 2, 19, 20]
const LIMIT = 30000000
let answer

function* generateElvesNumbers() {
  let memory = {}
  let currentIndex = 0
  let lastNumber

  const getLastNumberOffset = () =>
    memory[lastNumber] ? currentIndex - memory[lastNumber] : 0

  while (true) {
    const nextNumber =
      currentIndex < seed.length ? seed[currentIndex] : getLastNumberOffset()

    memory[lastNumber] = currentIndex
    currentIndex++
    lastNumber = nextNumber

    yield nextNumber
  }
}

const elvesNumbers = generateElvesNumbers()

for (i = 0; i < LIMIT; i++) {
  if (i % (LIMIT / 100) === 0) console.log(`progress ${(i * 100) / LIMIT}%`)
  answer = elvesNumbers.next().value
}

console.log(answer)
