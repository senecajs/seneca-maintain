#!/usr/bin/env node
const { Maintain } = require('./maintain.js')

let throwChecks = true
if ('return' == process.argv[2]) {
  throwChecks = false
}
Maintain(throwChecks)
