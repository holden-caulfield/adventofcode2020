const R = require("ramda")
const { lineByLine } = require("../utils/rxFile")
const { map, reduce, tap } = require("rxjs/operators")

const FILE = "./data.txt"

const parseLine = ({ rules, messages, section }, line) => {
  if (line === "") return { rules, messages, section: "MESSAGES" }
  switch (section) {
    case "RULES":
      const [id, rule] = line.split(": ")
      rules.set(id, rule)
      return { rules, messages, section }
    case "MESSAGES":
      return { rules, messages: [...messages, line], section }
  }
}

const rule$ = lineByLine(FILE).pipe(
  reduce(parseLine, { rules: new Map(), messages: [], section: "RULES" })
)

const parseRule = (rules, id) => {
  let value = rules.get(id)

  if (R.startsWith('"', value)) return value.replace(/"/g, "")
  if (value.includes("|")) value = `( ${value} )`

  return R.pipe(
    R.split(" "),
    R.chain((token) =>
      "(?|)+".includes(token) ? token : parseRule(rules, token)
    ),
    R.join("")
  )(value)
}

rule$.subscribe(({ rules, messages }) => {
  const regexStr = parseRule(rules, "0")
  const regex = new RegExp(`^${regexStr}$`, "g")
  const validMessages = R.filter((message) => message.match(regex), messages)

  console.log(`Number of valid messages: ${validMessages.length}`)
})
