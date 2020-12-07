const { lineByLine } = require("../utils/rxFile")
const R = require("ramda")
const { reduce, map } = require("rxjs/operators")

const FILE = "./sample.txt"

//'2 shiny  gold bags, 9 faded blue bags.'
const processContent = R.pipe(
  R.split(/ bags?,?\.? ?/), //['2 shiny  gold', '9 faded blue', '']
  R.init, //['2 shiny  gold', '9 faded blue']
  R.map(R.split(" ")), //[['2', 'shiny',  'gold'], ['9', 'faded', 'blue']]
  R.map(([amount, ...color]) => ({
    amount: parseInt(amount),
    color: R.join(" ", color)
  })) // [{amount: 2, color: 'shiny gold}, {amount: 9, color: 'faded blue'}]
)

const buildRuleEntry = ([container, content]) => [
  container,
  content.includes("no other") ? [] : processContent(content)
]

//muted yellow bags contain 2 shiny gold bags, 9 faded blue bags.
const parseRule = R.pipe(
  R.split(" bags contain "), //['muted yellow', '2 shiny  gold bags, 9 faded blue bags.']
  buildRuleEntry
)

const rule$ = lineByLine(FILE).pipe(map(parseRule))

const addRuleToReverseMap = (currentMap, rule) => {
  const [container, contents] = rule
  contents.forEach(({ color }) => {
    if (!R.has(color, currentMap)) currentMap[color] = []
    currentMap[color].push(container)
  })
  return currentMap
}

const addRuleToMap = (currentMap, [container, contents]) => ({
  ...currentMap,
  [container]: contents
})

const map$ = rule$.pipe(reduce(addRuleToMap, {}))
const reverseMap$ = rule$.pipe(reduce(addRuleToReverseMap, {}))

reverseMap$.subscribe((reverseMap) => {
  const possibleContainers = (color) => {
    const directContainers = reverseMap[color]
    if (!directContainers) return []
    return R.uniq([
      ...directContainers,
      ...R.chain(possibleContainers, directContainers)
    ])
  }

  const containersForShinyGold = possibleContainers("shiny gold")
  console.log(`Containers for shiny gold: ${containersForShinyGold.length}`)
})

map$.subscribe((containsMap) => {
  const containsCount = R.pipe(
    (color) => containsMap[color],
    R.map(({ amount, color }) => amount + amount * containsCount(color)),
    R.sum
  )
  console.log(`Contents of shiny gold: ${containsCount("shiny gold")}`)
})
