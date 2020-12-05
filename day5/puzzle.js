const data = require("./data.json")
const R = require("ramda")

const mapSeat = R.pipe(
   R.replace(/[F,L]/g,"0"),
   R.replace(/[B,R]/g,"1"),
   R.splitAt(7),
   R.map(value => parseInt(value, 2)),
   ([row, column]) => ({row, column, seatId: row * 8 + column}) 
)

const mappedData = data.map(mapSeat)

const sortedSeatIds = R.pipe(
    R.map(R.prop("seatId")),
    R.sort((a, b) => b - a)
)(mappedData)

console.log(`Highest seatId: ${R.head(sortedSeatIds)}`)

const findAvailableSeat = R.pipe(
    R.aperture(2),
    R.find(([next, previous]) => next - previous === 2),
    ([next, previous]) => next - 1
)

console.log(`The available seatId is: ${findAvailableSeat(sortedSeatIds)}`)