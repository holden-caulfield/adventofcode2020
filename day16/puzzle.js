const { lineByLine } = require("../utils/rxFile")
const { map, reduce, tap } = require("rxjs/operators")
const R = require("ramda")

const FILE = "./data.txt"

const INITIAL_STATE = {
  currentSection: "RULES",
  data: { rules: new Map(), ticket: [], nearbyTickets: [] }
}

const parseRule = (state, line) => {
  const regexp = /(.*): (\d*)-(\d*) or (\d*)-(\d*)/
  const [_, field, min1, max1, min2, max2] = line.match(regexp)

  state.data.rules.set(field, [
    [parseInt(min1), parseInt(max1)],
    [parseInt(min2), parseInt(max2)]
  ])
}

const ticketValues = (line) => R.map(parseInt, line.split(","))

const parseTicket = (state, line) => {
  state.data.ticket = ticketValues(line)
}

const parseNearbyTicket = (state, line) => {
  state.data.nearbyTickets.push(ticketValues(line))
}

const lineParsers = {
  RULES: parseRule,
  TICKET: parseTicket,
  NEARBY: parseNearbyTicket
}

const parseLine = (state, line) => {
  switch (line) {
    case "":
      return state
    case "your ticket:":
      return { ...state, currentSection: "TICKET" }
    case "nearby tickets:":
      return { ...state, currentSection: "NEARBY" }
    default:
      lineParsers[state.currentSection](state, line)
      return state
  }
}

const parsedData$ = lineByLine(FILE).pipe(reduce(parseLine, INITIAL_STATE))

const rangeIncludes = (value) => ([min, max]) => value >= min && value <= max
const validForRule = (value) => (ranges) => R.any(rangeIncludes(value), ranges)
const isInvalidValue = (rules, value) =>
  R.none(validForRule(value), [...rules.values()])

const case1 = ({ rules, nearbyTickets }) => {
  const sumInvalid = R.pipe(
    R.chain(R.filter((value) => isInvalidValue(rules, value))),
    R.sum
  )(nearbyTickets)
  console.log(`sum of invalid values ${sumInvalid}`)
}

const case2 = ({ rules, ticket, nearbyTickets }) => {
  const allFieldOptions = R.map(
    R.always([...rules.keys()]),
    R.range(0, ticket.length)
  )

  const filterForValue = ([fields, value]) =>
    R.filter((field) => validForRule(value)(rules.get(field)), fields)

  const isInvalidTicket = (ticket, rules) =>
    R.any((value) => isInvalidValue(rules, value), ticket)

  const validFieldOptions = R.reduce(
    (options, ticket) => {
      if (isInvalidTicket(ticket, rules)) return options
      const pairs = R.zip(options, ticket)
      return R.map(filterForValue, pairs)
    },
    allFieldOptions,
    nearbyTickets
  )

  const indexOptions = (optionsSet) =>
    optionsSet.map((options, index) => ({ index, options }))

  const ticketFieldsMap = R.pipe(
    indexOptions,
    R.sortBy((indexedOptionsEntry) => indexedOptionsEntry.options.length),
    R.reduce((acc, entry) => {
      const [fieldForIndex] = R.without(Object.keys(acc), entry.options)
      return { ...acc, [fieldForIndex]: entry.index }
    }, {})
  )(validFieldOptions)

  const prodDepartureValues = R.pipe(
    R.filter(R.startsWith("departure")),
    R.map((key) => ticket[ticketFieldsMap[key]]),
    R.product
  )(Object.keys(ticketFieldsMap))

  console.log(`Product of ticket departure values: ${prodDepartureValues}`)
}

parsedData$.subscribe(({ data }) => {
  case1(data)
  case2(data)
})
