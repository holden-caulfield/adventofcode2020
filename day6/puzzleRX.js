const { lineByLine } = require("../utils/rxFile")
const R = require("ramda")
const { reduce, map, tap } = require('rxjs/operators')

const FILE = "./data.txt"

const addMember = (group, memberAnswers) => ({
    anyAnswered: R.union(group.anyAnswered, memberAnswers),
    allAnswered: group.allAnswered ? 
        R.intersection(group.allAnswered, memberAnswers) : memberAnswers
})

const getTotal = prop => R.reduce((acc, group) => acc + group[prop].length, 0)

const group$ = lineByLine(FILE).pipe(
    reduce(
        ([groups, currentGroup], line) => line === "" 
            ? [[...groups, currentGroup], []]
            : [groups, addMember(currentGroup, line)], 
        [[], {}]
    ),
    map(([groups, currentGroup]) => groups),
)

group$.subscribe(groups => {
    console.log(`Total ANY answered: ${getTotal("anyAnswered")(groups)}`)
    console.log(`Total ALL answered: ${getTotal("allAnswered")(groups)}`)
})
