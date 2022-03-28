module.exports = {
  Maintain: function (throwChecks = true) {
    // Node modules
    const Path = require('path')
    const Fs = require('fs')

    // External modules
    const Filehound = require('filehound')
    const Hoek = require('@hapi/hoek')
    const Marked = require('marked')

    // Internal modules
    const { checkList } = require('./checks')
    const defineChecks = checkOperations()

    // Main function
    return runChecks()

    async function runChecks() {
      let prep = await runChecksPrep()
      if (null == prep)
        throw new Error(
          'Issue with preparation function runChecksPrep() - returns undefined.\n'
        )
      let relCheckList = prep.relCheckList
      let dataForChecks = prep.dataForChecks
      let results = {}
      let resultsLog = []

      for (const checkName in relCheckList) {
        let checkDetails = checkList[checkName]
        checkDetails.name = checkName

        let checkKind = defineChecks[checkDetails.kind]
        if (null == checkKind)
          throw new Error('Check operation is not defined in script.\n')

        let res = await checkKind(checkDetails, dataForChecks)
        if (null == res)
          throw new Error(
            'Problem with running check ' +
              checkDetails.name +
              ' - return obj is undefined\n'
          )
        results[checkName] = res
        if (false == res.pass) {
          resultsLog.push('\n' + res.check + ' failed (' + res.why + ')')
        }
      }
      if (throwChecks && 0 < resultsLog.length) {
        throw new Error('Failed Checks:\n' + resultsLog + '\n')
      } else {
        return results
      }
    }

    async function runChecksPrep() {
      // reading client's json files in
      const jsonPromise = Filehound.create()
        .paths(process.cwd())
        .discard(/node_modules/, /.git/)
        .ext('json')
        .find()
      const jsonFiles = await jsonPromise
      if (null == jsonFiles)
        throw new Error('Local JSON file names not found correctly\n')

      // non-json files
      const stringPromise = Filehound.create()
        .paths(process.cwd())
        .discard(/node_modules/, /.git/, /.json/)
        .find()
      const stringFiles = await stringPromise
      // add git config file to file list (for default branch check)
      stringFiles.push(process.cwd() + '/.git/config')
      if (null == stringFiles)
        throw new Error('Local file names (excl JSON) not found correctly\n')

      let dataForChecks = {}

      for (let j = 0; j < jsonFiles.length; j++) {
        let filePath = jsonFiles[j]

        let fileName = Path.basename(filePath)
        let fileContent = require(filePath)
        if (null == fileContent)
          throw new Error('Problem reading ' + filename + ' file\n')

        dataForChecks[fileName] = fileContent

        //to get package and main name from package.json file
        if ('package.json' == fileName) {
          dataForChecks.packageName = fileContent.name
        }
      }

      // For config def
      let fileExts = []

      for (let s = 0; s < stringFiles.length; s++) {
        let filePath = stringFiles[s]

        let fileName = Path.basename(filePath)
        fileExts.push(Path.extname(fileName))
        let fileContent = Fs.readFileSync(filePath, 'utf-8')
        if (null == fileContent)
          throw new Error('Problem reading ' + filename + ' file\n')

        dataForChecks[fileName] = fileContent
      }

      let config = ['base']
      if (fileExts.includes('.ts')) {
        config.push('ts')
      } else if (fileExts.includes('.js')) {
        config.push('js')
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
          let fileX = checkDetails.fileX
          let pass = file in dataForChecks
          let why = 'json_file_not_found'
          let searchContent = checkDetails.contains
          let searchIsNot = checkDetails.contains_is_not
          let containsType = checkDetails.contains_type
          let config = checkDetails.config

          if (true == pass) {
            const fileContent = dataForChecks[file]

            // add in "if else if" or switch clause if searching for json value at any point
            let searchIs = Hoek.reach(fileContent, searchContent)
            pass = null != searchIs && searchIsNot != searchIs

            if (true == pass) {
              if ('js' == config) {
                fileX = searchIs
                pass = fileX in dataForChecks
              }
              if ('ts' == config) {
                fileX = Path.basename(searchIs, '.js') + '.ts'
                pass = fileX in dataForChecks
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
                'heading' == token.type &&
                (1 == token.depth || 2 == token.depth)
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

        check_branch: async function (checkDetails, dataForChecks) {
          let file = checkDetails.file
          let pass = file in dataForChecks
          let branch = checkDetails.branch
          let why = 'file_not_found'

          if (true == pass) {
            const fileContent = dataForChecks[file]

            pass = fileContent.includes(branch)

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
  },
}
