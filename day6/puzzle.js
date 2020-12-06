const readline = require('readline');
const fs = require('fs');
const R = require("ramda")

const FILE = "./data.txt"

let groups = [], currentGroup = {}

const addCurrentGroup = () => {
    groups = [...groups, currentGroup]
    currentGroup = {}
}

const addMember = (group, memberAnswers) => ({
    anyAnswered: R.union(group.anyAnswered, memberAnswers),
    allAnswered: group.allAnswered ? 
        R.intersection(group.allAnswered, memberAnswers) : memberAnswers
})

const getTotal = prop => R.reduce((acc, group) => acc + group[prop].length, 0)

const readInterface = readline.createInterface({
    input: fs.createReadStream(FILE),
    console: false
});
    
readInterface.on('line', (line) => {
    if (line === "") {
        addCurrentGroup()
    } else {
        currentGroup = addMember(currentGroup, line)
    }
})

readInterface.on("close", () =>  {
    addCurrentGroup()
    console.log(`Total ANY answered: ${getTotal("anyAnswered")(groups)}`)
    console.log(`Total ALL answered: ${getTotal("allAnswered")(groups)}`)
})   