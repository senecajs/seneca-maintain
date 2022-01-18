const { Console } = require('console')

module.exports = function Maintain() {
  // Node modules
  const Path = require('path')
  const Fs = require('fs')

  // External modules
  const Filehound = require('filehound')
  const Hoek = require('@hapi/hoek')
  const Marked = require('marked')
  const { Command } = require('commander')

  // Internal modules
  const { checkList } = require('./checks')
  const defineChecks = checkOperations()

  // Main function
  async function runChecks(config) {
    let prep = await runChecksPrep(config)
    let relCheckList = prep.relCheckList
    let dataForChecks = prep.dataForChecks
    let results = {}

    for (const checkName in relCheckList) {
      let checkDetails = checkList[checkName]
      checkDetails.name = checkName

      let checkKind = defineChecks[checkDetails.kind]
      // ensure check operation is detailed below
      if (null == checkKind) {
        console.log('WARNING', 'Check does not exist', checkName)
        continue
      }
      let res = await checkKind(checkDetails, dataForChecks)
      results[checkName] = res
    }
    return results
  }

  async function runChecksPrep(config) {
    // reading client's json files in
    const jsonPromise = Filehound.create()
      .paths(process.cwd())
      .discard(/node_modules/, /.git/)
      .ext('json')
      .find()
    const jsonFiles = await jsonPromise

    // non-json files
    const stringPromise = Filehound.create()
      .paths(process.cwd())
      .discard(/node_modules/, /.git/, /.json/)
      .find()
    const stringFiles = await stringPromise

    let dataForChecks = {}

    for (let j = 0; j < jsonFiles.length; j++) {
      let filePath = jsonFiles[j]

      let fileName = Path.basename(filePath)
      let fileContent = require(filePath)

      dataForChecks[fileName] = fileContent

      //to get package and main name from package.json file
      if ('package.json' == fileName) {
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
      if (config.includes(checkDetails.config)) {
        relCheckList[checkName] = checkDetails
      }
    }
    return {
      relCheckList: relCheckList,
      dataForChecks: dataForChecks,
    }
  }

  runAll()

  async function runAll() {
    console.log('Running standardisation checks on your plugin...')
    let config = await configDef()
    console.log('Configuration : ', config)
    let checkResults = await runChecks(config)
    console.log('Process complete.')
    let checkConc = await conclusion(checkResults)
    console.log(checkConc)
  }

  async function configDef() {
    var argString = process.argv.slice(2)
    if (null == argString[0]) {
      argString[0] = 'base'
    }
    const argArray = argString[0].split(',')
    return argArray

    const Program = new Command()
    Program.option('-n --no-base', 'Do not run checks in base configuration.')
      .option('-j --javascript', 'Include JavaScript-specific checks.')
      .option('-t --typescript', 'Include TypeScript-specific checks.')
  }

  async function conclusion(checkResults) {
    let totalNb = 0
    let failNb = 0
    let note = ''
    let fails = []
    for (const check in checkResults) {
      totalNb++
      let checkDetails = checkResults[check]
      checkDetails.name = check
      if (false == checkDetails.pass) {
        failNb++
        let checkWhy = checkDetails.why
        let failWhy =
          checkDetails.check + ' (why: ' + checkWhy.replace(/_/g, ' ') + ')'
        fails.push(failWhy)
      }
    }
    if (0 == failNb) {
      note = 'Congratulations! Your plugin meets all of the current standards.'
    } else {
      note =
        'Please refer to the README.md document for descriptions of all checks.'
    }
    fails = fails.join('\n\t')
    let message = `Total checks for this configuration: ${totalNb}
    \nFailed checks: ${failNb}\n\t${fails}
    \n${note}`
    return message
  }

  // --------------------------------------------------------------------

  function checkOperations() {
    return {
      file_exist: async function (checkDetails, dataForChecks) {
        let file = checkDetails.file
        let pass = file in dataForChecks
        let why = 'file_not_found'
        if (true == pass) {
          why = 'file_found'
        }

        return {
          check: checkDetails.name,
          kind: checkDetails.kind,
          file: file,
          pass: pass,
          why: why,
        }
      },

      fileX_exist_if_contain_json: async function (
        checkDetails,
        dataForChecks
      ) {
        let file = checkDetails.file
        let ifFile = checkDetails.if_file
        let pass = ifFile in dataForChecks
        let why = 'json_file_not_found'
        let searchContent = checkDetails.contains
        let searchIsNot = checkDetails.contains_is_not
        let containsType = checkDetails.contains_type
        let config = checkDetails.config

        if (true == pass) {
          const ifFileContent = dataForChecks[ifFile]
          if ('key' == containsType) {
            let searchIs = Hoek.reach(ifFileContent, searchContent)
            pass = null != searchIs && searchIsNot != searchIs
          } else {
            // add in "else if" clause if searching for json value
            console.log('Content type not recognised.')
            pass = false
          }

          if (true == pass) {
            if ('js' == config) {
              file = searchIs
              pass = file in dataForChecks
            }
            if ('ts' == config) {
              file = Path.basename(searchIs, '.js') + '.ts'
              pass = file in dataForChecks
            }

            if (true == pass) {
              why = 'file_found'
            } else {
              why = 'file_not_found'
            }
          } else {
            why = 'incorrect_value'
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

      content_contain_string: async function (checkDetails, dataForChecks) {
        let file = checkDetails.file
        let pass = file in dataForChecks
        let searchContent = checkDetails.contains
        let why = 'file_not_found'

        if (true == pass) {
          const fileContent = dataForChecks[file]

          for (let i = 0; i < searchContent.length; i++) {
            pass = fileContent.includes(searchContent[i])
          }

          if (true == pass) {
            why = 'content_found'
          } else {
            why = 'content_not_found'
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

      content_contain_markdown: async function (checkDetails, dataForChecks) {
        let file = checkDetails.file
        let pass = file in dataForChecks
        let why = 'file_not_found'
        if (true == pass) {
          why = 'file_found'

          let searchArray = checkDetails.contains
          // Reassignment of #1 heading text
          searchArray[0].text = dataForChecks.packageName

          let fileContent = dataForChecks[file]
          // Creating AST from file
          const lexer = new Marked.Lexer()
          const tokens = lexer.lex(fileContent)
          const headings = tokens.filter(
            (token) =>
              'heading' == token.type && (1 == token.depth || 2 == token.depth)
          )

          if (headings.length == searchArray.length) {
            let searchFail = ''
            for (let i = 0; i < searchArray.length; i++) {
              pass =
                headings[i].depth == searchArray[i].depth &&
                headings[i].text == searchArray[i].text
              if (false == pass) {
                let nb = i + 1
                searchFail += '_"' + searchArray[i].text + '"'
              }
            }
            why = 'heading(s)' + searchFail + '_not_found'
          } else {
            pass = false
            why =
              'nb_headings_incorrect_-_' +
              searchArray.length +
              '_required,_' +
              headings.length +
              '_found'
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

      content_contain_json: async function (checkDetails, dataForChecks) {
        let file = checkDetails.file
        let pass = file in dataForChecks
        let searchContent = checkDetails.contains
        let containsType = checkDetails.contains_type
        // let searchLevels = Object.values(searchContent)
        let why = 'file_not_found'

        if (true == pass) {
          const fileContent = dataForChecks[file]
          if ('key' == containsType) {
            pass = null != Hoek.reach(fileContent, searchContent)
          } else {
            // add in "else if" clause if searching for json value
            console.log('Content type not recognised.')
            pass = false
          }

          if (true == pass) {
            why = 'content_found'
          } else {
            why = 'content_not_found'
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
