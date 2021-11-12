module.exports = () => {

  const Filehound = require('filehound')
  console.log('Running maintain from @seneca/maintain')

  function run(){
    console.log('Run function')
    Filehound.create()
      .paths(process.cwd())
      .discard(/node_modules/)
      .find()
      .then(files => {
        files.forEach(file => console.log('Found file', file));
      })
  }

  run()
}
// "undefined" is returned if test file calls a console log of module instead of calling module function directly
