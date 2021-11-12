module.exports = () => {

  const Filehound = require('filehound')
  const Path = require('path')
  const Fs = require('fs')
  const Hoek = require('@hapi/hoek')
  const Marked = require('marked')

  const checkList = require('./checks')
  const checkOps = checkOperations()

  console.log('Running maintain from @seneca/maintain')

  async function runChecksPrep(){
    console.log('runChecksPrep()\n')

    // config definition
    var argString = process.argv.slice(2)
    if (null == argString[0]) {
      argString[0] = "base"
    }
    const argArray = argString[0].split(',')

    // backing out of test directory
    process.chdir('../')

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

    const relCheckList = {}
    for (const checkName in checkList) {
      let checkDetails = checkList[checkName]
      if (argArray.includes(checkDetails.config)){
        relCheckList[checkName] = checkDetails
      }
    }
    // console.log(relCheckList)
    return {
      relCheckList: relCheckList,
      dataForChecks: dataForChecks
    }
  }

  async function runChecks(){
    console.log('runChecks()\n')
    let prep = await runChecksPrep()
    let relCheckList = prep.relCheckList //ok
    let dataForChecks = prep.dataForChecks //ok
    let results = {}

    for(const checkName in relCheckList) {
      let checkDetails = checkList[checkName] //ok 
      checkDetails.name = checkName //ok

      let checkKind = checkOps[checkDetails.kind] // now ok
      // ensure check operation is detailed below
      if(null == checkKind) {
        console.log('WARNING','Check does not exist', checkName)
        // proceed to next check
        continue
      }
      let res = await checkKind(checkDetails,dataForChecks)
      console.log('\n\n',res)
      results[checkName] = res
    }
    return results
  }

  // runChecksPrep()
  runChecks()

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

          let fileContent = dataForChecks[file]
          // Creating AST from file
          const lexer = new Marked.Lexer()
          const tokens = lexer.lex(fileContent)
          const headings = tokens.filter(token => "heading" == token.type 
            && (1 == token.depth || 2 == token.depth))

          if (headings.length == searchArray.length) {
            for (let i = 0 ; i < searchArray.length; i++) {
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

}
// "undefined" is returned if test file calls a console log of module instead of calling module function directly
