#!/usr/bin/env node

const { Maintain } = require('../maintain')

conclusionCLI()

async function conclusionCLI() {
  // throwing errors during checks = false
  let checkResults = await Maintain(false)

  let totalNb = 0
  let failNb = 0
  let note = ''
  let fails = []

  for (const check in checkResults) {
    totalNb++
    let checkDetails = checkResults[check]
    checkDetails.name = check
    if (false == checkDetails.pass) {
      failNb++
      let checkWhy = checkDetails.why
      let failWhy =
        checkDetails.check + ' (why: ' + checkWhy.replace(/__/g, ' ') + ')'
      fails.push(failWhy)
    }
  }

  if (0 == failNb) {
    note = 'Congratulations! Your plugin meets all of the current standards.'
  } else {
    note =
      'Please refer to the README.md document for descriptions of all checks.\nhttps://github.com/senecajs/seneca-maintain/blob/main/README.md'
  }

  fails = fails.join('\n\t')

  let message = `Total checks for this configuration: ${totalNb}
  \nFailed checks: ${failNb}\n\t${fails}
  \n${note}`

  console.log(message)
}
