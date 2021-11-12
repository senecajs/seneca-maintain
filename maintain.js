module.exports = () => {

  const Filehound = require('filehound')
  console.log('Running maintain from @seneca/maintain')

  function run(){
    console.log('Run function')

    console.log('Starting dir : ',process.cwd())
    process.chdir('../')
    console.log('Current dir : ',process.cwd())

    Filehound.create()
      .paths(process.cwd())
      .discard(/node_modules/,/.git/)
      .find()
      .then(files => {
        files.forEach(file => console.log('Found file', file));
      }) // this is a promise, it will print at the end of the run

    
  }

  run()
}
// "undefined" is returned if test file calls a console log of module instead of calling module function directly
