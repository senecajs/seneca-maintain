module.exports = () => {

  const Filehound = require('filehound')
  const Path = require('path')
  const Fs = require('fs')

  console.log('Running maintain from @seneca/maintain')

  async function run(){
    console.log('Run function')

    console.log('Starting dir : ',process.cwd())
    process.chdir('../')
    console.log('Current dir : ',process.cwd())

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

  }

  run()
}
// "undefined" is returned if test file calls a console log of module instead of calling module function directly