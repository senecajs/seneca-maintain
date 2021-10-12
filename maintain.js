/* Copyright © 2021 Ríona Stokes and other contributors, MIT License. */
'use strict'

// function-related constants
const Fs = require('fs')
const Filehound = require('filehound')
const Path = require('path')
const jsonFile = require('jsonfile') 
const Hoek = require('@hapi/hoek')
const Marked = require('marked')

// file-related constants
const checkList = require('./checks.js')

const checkOps = checkOperations()

async function Maintain() {
  console.log('MAINTAIN 0.0.4')

  const argString = process.argv.slice(2)
  if (null == argString[0]) {
    throw new Error("Configuration must be specified. See README.md for details.")
  }
  const argArray = argString[0].split(',')

  async function runChecksPrep() {
    
    // reading client's JSON files in
    const jsonPromise = Filehound.create()
      .paths(process.cwd())
      .discard(/node_modules/) // This being a regex instead of a string still leads to "undefined" printing
      .ext('json')
      .find();
    const jsonFiles = await jsonPromise // this returns "undefined" at the moment
    
    // non-JSON files
    const stringPromise = Filehound.create()
      .paths(process.cwd())
      .discard(/node_modules/)
      .discard('.json')
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

    // Filter checks object for specific configuration
    const relCheckList = {}
    for (const checkName in checkList) {
      let checkDetails = checkList[checkName]
      if (argArray.includes(checkDetails.config)){
        relCheckList[checkName] = checkDetails
      }
    }

    return {
      relCheckList: relCheckList,
      dataForChecks: dataForChecks
    }
  }

  async function runChecks() {
    console.log("\n\t@SENECA-MAINTAIN\n")
    let prep = await runChecksPrep()
    let relCheckList = prep.relCheckList
    let dataForChecks = prep.dataForChecks
    let results = {}
    
    for(const checkName in relCheckList) {
      let checkDetails = checkList[checkName]
      checkDetails.name = checkName

      // make sure operation of function is detailed below
      let checkKind = checkOps[checkDetails.kind]
      if(null == checkKind) {
        console.log('WARNING', 'Check does not exist', checkName, checkDetails.kind)
        // proceed to next check
        continue
      }
      let res = await checkKind(checkDetails,dataForChecks)
      results[checkName] = res
    }   
    
    return results

  }

  async function conclusion(checkResults) {
    let totalNb = 0
    let failNb = 0
    let note = ""
    let fails = []
    for (const check in checkResults) {
      totalNb++
      let checkDetails = checkResults[check]
      checkDetails.name = check
      if (false == checkDetails.pass) {
        failNb++
        let failWhy = checkDetails.check + " (why: " + checkDetails.why + ")"
        fails.push(failWhy)
      }
    }
    if (0 == failNb){
      note = "Congratulations! Your plugin meets all of the current standards."
    }
    else {
      note = "@SENECA/MAINTAIN\nPlease refer to the README.md document for descriptions of all checks."
    }
    fails = fails.join('\n\t')
    let message = `Total checks for this configuration: ${totalNb}
    \nFailed checks: ${failNb}\n\t${fails}
    \n${note}`
    return message
  }

  // --------------------------------------------------------------------
  async function runAll() {
    console.log("Running checks on your plugin...")
    let checkResults = await runChecks()
    console.log("Process complete.")
    let checkConc = await conclusion(checkResults)
    console.log(checkConc)
  }
  // --------------------------------------------------------------------

  function checkOperations() {

    return {
      file_exist: async function(checkDetails,dataForChecks) {
        let file = checkDetails.file
        let pass = file in dataForChecks
        let why = "file_not_found"
        if (true == pass){
          why = "file_found"
        }

        return {
          check: checkDetails.name,
          kind: checkDetails.kind,
          file: file,
          pass: pass,
          why: why,
        }
      },

      fileX_exist_if_contain_json: async function(checkDetails,dataForChecks) {

        let file = checkDetails.file
        let ifFile = checkDetails.if_file
        let pass = ifFile in dataForChecks
        let why = "json_file_not_found"
        let searchContent = checkDetails.contains
        let searchIsNot = checkDetails.contains_is_not
        let containsType = checkDetails.contains_type
        let config = checkDetails.config

        if (true == pass) {
          const ifFileContent = dataForChecks[ifFile]
          if ("key" == containsType) {
            // let chain = []
            // for (let i = 0; i < searchContent.length; i++) {
            //     chain.push(searchContent[i])
            // }
            var searchIs = Hoek.reach(ifFileContent,searchContent)
            pass = (null != searchIs && searchIsNot != searchIs)

          }
          else { // add in "else if" clause if searching for json value
            console.log("Content type not recognised.")
            pass = false
          }

          if (true == pass) {
            if ("js" == config) {
              file = searchIs
              pass = file in dataForChecks
            }
            if ("ts" == config) {
              file = Path.basename(searchIs,'.js')+'.ts'
              pass = file in dataForChecks
            }

            if (true == pass) {
            why = "file_found"
            }
            else {
              why = "file_not_found"
            }
          }
          else {
            why = "incorrect_value"
          }

            
        }

        return {
          check: checkDetails.name,
          kind: checkDetails.kind,
          file: file,
          pass: pass,
          why: why,
        }
      },

      content_contain_string: async function(checkDetails,dataForChecks) {

        let file = checkDetails.file
        let pass = file in dataForChecks
        let searchContent = checkDetails.contains
        let why = "file_not_found"

        if (true == pass) {
          const fileContent = dataForChecks[file]

          for (let i = 0; i < searchContent.length; i++) {
            pass = fileContent.includes(searchContent[i])
          }
          
          if (true == pass) {
            why = "content_found"
          }
          else {
            why = "content_not_found"
          }
        }

        return {
          check: checkDetails.name,
          kind: checkDetails.kind,
          file: file,
          pass: pass,
          why: why,
        }
      },

      content_contain_markdown: async function(checkDetails,dataForChecks) {
        let file = checkDetails.file
        let pass = file in dataForChecks
        let why = "file_not_found"
        if (true == pass){
          why = "file_found"

          let searchArray = checkDetails.contains
          // Reassignment of #1 heading text
          searchArray[0].text = dataForChecks.packageName
          console.log(searchArray[0].text)

          let fileContent = dataForChecks[file]
          // Creating AST from file
          const lexer = new Marked.Lexer()
          const tokens = lexer.lex(fileContent)
          const headings = tokens.filter(token => "heading" == token.type 
            && (1 == token.depth || 2 == token.depth))

          if (headings.length == searchArray.length) {
            console.log(searchArray.length)
            for (let i = 0 ; i < searchArray.length; i++) {
              console.log(i)
              pass = ((headings[i].depth == searchArray[i].depth) 
                && (headings[i].text == searchArray[i].text))
              if (false == pass) {
                let nb = i+1
                why = "heading_\""+searchArray[i].text+"\"_not_found"
                break
              }
            }
          }
          else {
            pass = false
            why = "nb_headings_incorrect"
          }
        }

        return {
          check: checkDetails.name,
          kind: checkDetails.kind,
          file: file,
          pass: pass,
          why: why,
        }
      },

      content_contain_json: async function(checkDetails,dataForChecks) {

        let file = checkDetails.file
        let pass = file in dataForChecks
        let searchContent = checkDetails.contains
        let containsType = checkDetails.contains_type
        // let searchLevels = Object.values(searchContent)
        let why = "file_not_found"

        if (true == pass) {
          const fileContent = dataForChecks[file]
          if ("key" == containsType) {
            // clean this up
            // let chain = []
            // for (let i = 0; i < searchContent.length; i++) {
            //     chain.push(searchContent[i])
            // }
            pass = (null != (Hoek.reach(fileContent,searchContent)))

          }
          else { // add in "else if" clause if searching for json value
            console.log("Content type not recognised.")
            pass = false
          }
          
          if (true == pass) {
            why = "content_found"
          }
          else {
            why = "content_not_found"
          }
        }

        return {
          check: checkDetails.name,
          kind: checkDetails.kind,
          file: file,
          pass: pass,
          why: why,
        }
      },

    }
  }
  
  // -------------------------------------------------------
  runAll()
  // -------------------------------------------------------

}


module.exports = {
  Maintain
}