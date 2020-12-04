const { validateField } = require('./validations')

console.log(`byr valid:   2002 - ${validateField('byr', "2002")}`)
console.log(`byr invalid: 2003 - ${validateField('byr', "2003")}`)

console.log(`hgt valid:   60in - ${validateField('hgt', "60in")}`)
console.log(`hgt valid:   190cm - ${validateField('hgt', "190cm")}`)
console.log(`hgt invalid: 190in - ${validateField('hgt', "190in")}`)
console.log(`hgt invalid: 190 - ${validateField('hgt', "190")}`)

console.log(`hcl valid:   #123abc - ${validateField('hcl', "#123abc")}`)
console.log(`hcl invalid: #123abz - ${validateField('hcl', "#123abz")}`)
console.log(`hcl invalid: 123abc - ${validateField('hcl', "123abc")}`)

console.log(`ecl valid:   brn - ${validateField('ecl', "brn")}`)
console.log(`ecl invalid:   wat - ${validateField('ecl', "brwatn")}`)

console.log(`pid valid:   000000001 - ${validateField('pid', "000000001")}`)
console.log(`pid invalid:   0123456789 - ${validateField('pid', "0123456789")}`)

