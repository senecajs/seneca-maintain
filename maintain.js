module.exports = () => {

  const Filehound = require('filehound')
  const Path = require('path')
  const Fs = require('fs')

  const checkList = require('./checks')

  console.log('Running maintain from @seneca/maintain')

  console.log('Starting dir : ',process.cwd())
  process.chdir('../')
  console.log('Current dir : ',process.cwd())

  async function runChecksPrep(){
    console.log('\nrunChecksPrep function')

    // reading client's json files in
    const jsonPromise = Filehound.create()
      .paths(process.cwd())
      .discard(/node_modules/,/.git/)
      .ext('json')
      .find();
    const jsonFiles = await jsonPromise

    // non-json files
    const stringPromise = Filehound.create()
      .paths(process.cwd())
      .discard(/node_modules/,/.git/,/.json/)
      .find();
    const stringFiles = await stringPromise

    let dataForChecks = {}

    for (let j = 0; j < jsonFiles.length; j++) {
      let filePath = jsonFiles[j]

      let fileName = Path.basename(filePath)
      let fileContent = require(filePath)

      dataForChecks[fileName] = fileContent

      //to get package and main name from package.json file
      if ("package.json" == fileName) {
          dataForChecks.packageName = fileContent.name
      }
  }

    for (let s = 0; s < stringFiles.length; s++) {
      let filePath = stringFiles[s]

      let fileName = Path.basename(filePath)
      let fileContent = Fs.readFileSync(filePath, 'utf-8')

      dataForChecks[fileName] = fileContent
    }

    var dataKeys = Object.keys(dataForChecks)
    console.log(dataKeys)
    console.log('Package name :', dataForChecks.packageName)

    const relCheckList = {}
    for (const checkName in checkList) {
      let checkDetails = checkList[checkName]
      // if (argArray.includes(checkDetails.config)){
      //   relCheckList[checkName] = checkDetails
      // }
      relCheckList[checkName] = checkDetails
    }
    var checkNames = Object.keys(relCheckList)
    console.log(checkNames)
  }

  async function runChecks(){}

  runChecksPrep()
}
// "undefined" is returned if test file calls a console log of module instead of calling module function directly
