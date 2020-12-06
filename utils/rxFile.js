const { fromEvent } = require('rxjs');
const { takeUntil } = require('rxjs/operators')
const readline = require('readline');
const fs = require('fs');

const lineByLine = filePath => {
    const rl = readline.createInterface({
        input: fs.createReadStream(filePath)
      });

    return fromEvent(rl, 'line').pipe(
        takeUntil(fromEvent(rl, 'close'))
    )
}

module.exports = {
    lineByLine
}