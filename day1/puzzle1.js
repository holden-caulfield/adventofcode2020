let data = require('./data.json')

let numCompare = (a, b) => b - a
let sortedData = data.sort(numCompare)

var num1, num2, sum

for (var i = 0; i < sortedData.length; i++) {
    for (var j = sortedData.length; j > 0; j--) {
        num1 = sortedData[i]
        num2 = sortedData[j]
        sum = num1 + num2
        if (sum === 2020) {
            console.log(num1, num2)
            console.log(num1 * num2)
            return
        }
        if (sum > 2020) break;
    }
}