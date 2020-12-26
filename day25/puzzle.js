const cardPublicKey = 7573546,
  doorPublicKey = 17786549,
  subjectNumber = 7

const transform = (subject, predicate) => {
  let value = 1,
    loops = 0
  while (!predicate(value, loops)) {
    loops++
    value = (value * subject) % 20201227
  }
  return [value, loops]
}

const decryptLoopSize = (subject, key) => {
  const [value, loops] = transform(subject, (value, loops) => value === key)
  return loops
}

const calculateEncryptionKey = (subject, loopSize) => {
  const [value, loops] = transform(
    subject,
    (value, loops) => loops === loopSize
  )
  return value
}

const cardLoopSize = decryptLoopSize(subjectNumber, cardPublicKey)
const doorLoopSize = decryptLoopSize(subjectNumber, doorPublicKey)

const encryptionKey = calculateEncryptionKey(cardPublicKey, doorLoopSize)
const encryptionKeyCheck = calculateEncryptionKey(doorPublicKey, cardLoopSize)

console.log(encryptionKey, encryptionKeyCheck)
