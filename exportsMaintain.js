module.exports.Maintain = {
  test1: async function () {
    console.log('test1')
    const {
      Maintain: { test2 },
    } = require('./exportsMaintain')
    test2()
  },
  test2: async function () {
    console.log('test2')
  },

  runChecks: async function (prep) {
    // Node modules
    const Path = require('path')
  },

  runChecksPrep: async function (config) {},

  runAll: async function () {
    // 50% of this is originally for log output
  },

  configDef: async function () {},

  conclusion: async function (checkResults) {
    // This is all for CLI tool
  },
}
