/* Copyright © 2021 Ríona Stokes and other contributors, MIT License. */
'use strict'

const Fs = require('fs')


async function Maintain() {
  console.log('MAINTAIN 0.0.2')

  const rootFolder = process.cwd()
  let foo = Fs.existsSync(rootFolder+'/foo.txt')

  if(!foo) {
    throw new Error('foo.text fail!')
  }
}


module.exports = {
  Maintain
}




