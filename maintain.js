module.exports = () => {

  const Chalk = require('chalk')
  console.log('Running maintain from @seneca/maintain')

  function run(){
    console.log(Chalk.blue('Run function'))
  }

  run()
}
