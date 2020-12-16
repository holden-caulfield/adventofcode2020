const seed = [0, 6, 1, 7, 2, 19, 20]
const LIMIT = 30000000
let memory = {}
let currentIndex = 0
let lastNumber, nextNumber

for (let i = 0; i < LIMIT; i++) {
  if (currentIndex < seed.length) {
    nextNumber = seed[currentIndex]
  } else {
    nextNumber = memory[lastNumber] ? currentIndex - memory[lastNumber] : 0
  }

  memory[lastNumber] = currentIndex
  currentIndex++
  lastNumber = nextNumber
}

console.log(lastNumber)
