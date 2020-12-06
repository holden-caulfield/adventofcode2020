const R = require("ramda")

const digits = (numDigits) => (value) =>
  value.match(new RegExp(`^\\d{${numDigits}}$`)) !== null
const range = (min, max) => (value) =>
  parseInt(value) >= min && parseInt(value) <= max
const inSet = (set) => (value) => set.includes(value)
const isColor = (value) => value.match(/#[a-f 0-9]{6}/) !== null
const yearInRange = (min, max) => R.allPass([digits(4), range(min, max)])

const isHeight = (value) => {
  const [amount, unit] = R.splitAt(value.length - 2, value)
  switch (unit) {
    case "cm":
      return range(150, 193)(amount)
    case "in":
      return range(59, 76)(amount)
    default:
      return false
  }
}

const validations = {
  byr: yearInRange(1920, 2002),
  iyr: yearInRange(2010, 2020),
  eyr: yearInRange(2020, 2030),
  hgt: isHeight,
  hcl: isColor,
  ecl: inSet(["amb", "blu", "brn", "gry", "grn", "hzl", "oth"]),
  pid: digits(9)
}

const validateField = (key, value) => validations[key](value)

const validatePassport = (passport) =>
  Object.keys(validations).every(
    (key) =>
      Object.keys(passport).includes(key) && validateField(key, passport[key])
  )

module.exports = {
  validateField,
  validatePassport
}
