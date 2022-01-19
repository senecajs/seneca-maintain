module.exports.Maintain = {
  runAll: function () {
    console.log('RUN ALL')
    this.configDef()
  },

  configDef: function () {
    console.log('Called by runAll')
  },
}
