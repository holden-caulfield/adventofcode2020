const data = require("./data.json")
const R = require("ramda")

const isValid = ({ min, max, letter, password }) => {
  const letters = [password.charAt(min - 1), password.charAt(max - 1)]
  return R.filter(R.equals(letter), letters).length === 1
}

const valid = data.filter(isValid)

console.log(valid.length)
