const readline = require('readline');
const fs = require('fs');
const { validatePassport } = require('./validations')

const FILE = "./data.txt"

let passports = []
let currentPassport = {}

const readInterface = readline.createInterface({
    input: fs.createReadStream(FILE),
    console: false
});
    
readInterface.on('line', (line) => {
    if (line === "") {
        passports.push(currentPassport)
        currentPassport = []
    } else {
        const newFields = line.split(" ").map(field => field.split(":"))
        newFields.forEach(([key, value]) => {
            currentPassport[key] = value
        })
    }
})

readInterface.on("close", () =>  {
    passports.push(currentPassport)
    const validPassports = passports.filter(validatePassport)
    console.log(validPassports.length)

})    

