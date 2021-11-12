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

    const stringPromise = Filehound.create()
      .paths(process.cwd())
      .discard(/node_modules/,/.git/,/.json/)
      .find();
    const stringFiles = await stringPromise

    let dataForChecks = {}

    for (let s = 0; s < stringFiles.length; s++) {
      let filePath = stringFiles[s]

      let fileName = Path.basename(filePath)
      let fileContent = Fs.readFileSync(filePath, 'utf-8')

      dataForChecks[fileName] = fileContent
    }

    console.log(dataForChecks['README.md'])

  }

  run()
}
// "undefined" is returned if test file calls a console log of module instead of calling module function directly
