module.exports = {
  checkList: function ({ config = ['base'], exclude = [], include = [] }) {
    const { checkList } = require('./checks')

    const relCheckList = {}

    let listToCheck = {}
    if (0 != include.length) {
      listToCheck = include
    } else {
      listToCheck = checkList
    }

    for (const checkName in listToCheck) {
      let checkDetails = checkList[checkName]
      if (
        'primary' == checkDetails.class &&
        config.includes(checkDetails.config)
      ) {
        relCheckList[checkName] = checkDetails
      }
    }

    if (0 != exclude.length) {
      for (let i = 0; i < exclude.length; i++) {
        delete relCheckList[exclude[i]]
      }
    }

    return relCheckList
  },

  Maintain: function ({ throwChecks = true, exclude = [], include = [] } = {}) {
    // Node modules
    const Path = require('path')
    const Fs = require('fs')

    // External modules
    const Filehound = require('filehound')

    // Internal modules
    const checkList = module.exports.checkList
    const defineChecks = module.exports.defineChecks

    // Main function
    return runChecks()

    async function runChecks() {
      let prep = await runChecksPrep({
        exclude: exclude,
        include: include,
      })
      if (null == prep)
        throw new Error(
          'Issue with preparation function runChecksPrep() - returns undefined.\n'
        )
      let relCheckList = prep.relCheckList
      let dataForChecks = prep.dataForChecks
      let results = {}
      let resultsLog = []

      for (const checkName in relCheckList) {
        let checkDetails = relCheckList[checkName]
        checkDetails.name = checkName

        let checkKind = defineChecks()[checkDetails.kind]
        if (null == checkKind)
          throw new Error('Check operation is not defined in script.\n')

        let res = null

        // primary/secondary check logic
        // if (null != checkDetails.secondary) {
        //   res = await checkKind(
        //     checkList()[checkDetails.secondary],
        //     dataForChecks
        //   )
        //   if (!res.pass) {
        //     continue
        //   }
        // }

        if (
          checkDetails.include_orgRepo[0].test(
            dataForChecks.orgName.concat('/', dataForChecks.packageName)
          ) &&
          !checkDetails.exclude_orgRepo[0].test(
            dataForChecks.orgName.concat('/', dataForChecks.packageName)
          )
        ) {
          res = await checkKind(checkDetails, dataForChecks)
        } else {
          continue
        }

        if (null == res)
          throw new Error(
            'Problem with running check ' +
              checkDetails.name +
              ' - return obj is undefined\n'
          )
        results[checkName] = res
        if (false == res.pass) {
          resultsLog.push(
            '\n' + res.check + ' failed (' + res.why.replace(/__/g, ' ') + ')'
          )
        }
      }
      if (throwChecks && 0 < resultsLog.length) {
        throw new Error('Failed Checks:\n' + resultsLog + '\n')
      } else {
        return results
      }
    }

    async function runChecksPrep({ exclude = [], include = [] }) {
      // reading client's json files in
      const jsonPromise = Filehound.create()
        .paths(process.cwd())
        .discard(/coverage/, /node_modules/, /.git/)
        .ext('json')
        .depth(0)
        .find()

      const jsonFiles = await jsonPromise
      if (null == jsonFiles)
        throw new Error(
          'Local JSON file names not found correctly - cannot run checks\n'
        )

      // non-json files
      let filePaths = [
        process.cwd() + '/dist/',
        process.cwd() + '/src/',
      ].filter((path) => Fs.existsSync(path))
      const stringPromise = Filehound.create()
        .paths(process.cwd(), ...filePaths)
        .discard(/node_modules/, /.git/, /.json/)
        .depth(0)
        .find()
      const stringFiles = await stringPromise
      // add specific git files for checks
      stringFiles.push(process.cwd() + '/.git/config')
      stringFiles.push(process.cwd() + '/.gitignore')
      if (null == stringFiles || 0 == Object.keys(stringFiles))
        throw new Error(
          'Local file names (excl JSON) not found correctly - cannot run checks\n'
        )

      let dataForChecks = {}

      for (let j = 0; j < jsonFiles.length; j++) {
        let filePath = jsonFiles[j]

        let fileName = Path.basename(filePath)
        let fileContent = require(filePath)
        if (null == fileContent)
          throw new Error('Problem reading ' + filename + ' file\n')

        dataForChecks[fileName] = fileContent

        // to get package and main name from top-level package.json file
        if (process.cwd() + '/' + 'package.json' == filePath) {
          dataForChecks.packageName = fileContent.name
          let repo_url_rx =
            /(git@|(git|(git\+)*https):\/\/)github.com(\/|:)([a-z]+)\/[a-z|-]+(.git)*/
          dataForChecks.orgName =
            fileContent.repository.url.match(repo_url_rx)?.[5]
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

      let relCheckList = checkList({
        config: config,
        include: include,
        exclude: exclude,
      })

      return {
        relCheckList: relCheckList,
        dataForChecks: dataForChecks,
      }
    }
  },

  // --------------------------------------------------------------------

  defineChecks: function () {
    // Node modules
    const Path = require('path')

    // External modules
    const Hoek = require('@hapi/hoek')
    const Marked = require('marked')

    // Check operation definition
    return {
      check_branch: async function (checkDetails, dataForChecks) {
        let file = checkDetails.file
        let pass = file in dataForChecks
        let branch = checkDetails.branch
        let why = 'git__config__file__not__found'

        if (true == pass) {
          const fileContent = dataForChecks[file]

          pass = fileContent.includes(branch)

          if (true == pass) {
            why = 'branch__correct'
          } else {
            why = 'branch__incorrect'
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
        let searchKey = checkDetails.contains_key
        let searchValue = checkDetails.contains_value
        let containsType = checkDetails.contains_type
        let why = 'file__' + file + '__not__found'

        // Pass definition specific to url_pkgjson check
        if ('url_pkgjson' == checkDetails.name) {
          pass = dataForChecks.orgName != null
        }

        if (pass) {
          const fileContent = dataForChecks[file]
          if ('key' == containsType) {
            pass = null != Hoek.reach(fileContent, searchKey)
          } else if ('value' == containsType) {
            pass = Hoek.reach(fileContent, searchKey).includes(searchValue)
          } else {
            pass = false
          }

          if (pass) {
            why = 'content__found'
          } else {
            why = 'content__not__found'
          }
        } else {
          why = 'content__not__found'
        }

        return {
          check: checkDetails.name,
          kind: checkDetails.kind,
          file: file,
          pass: pass,
          why: why,
        }
      },

      content_contain_jsonX_in_markdown: async function (
        checkDetails,
        dataForChecks
      ) {
        let file = checkDetails.file
        let jsonFile = checkDetails.jsonFile
        let pass = file in dataForChecks
        pass = jsonFile in dataForChecks
        let why = 'file__' + file + '__not__found'
        if (true == pass) {
          why = 'file__' + file + '__found'

          // getting jsonX
          let jsonFileContent = dataForChecks[jsonFile]
          let jsonX = ''
          if ('value' == checkDetails.jsonContains_type) {
            jsonX = jsonFileContent[checkDetails.jsonContains]
          }
          checkDetails.contains.text = jsonX

          let searchArray = checkDetails.contains
          let fileContent = dataForChecks[file]
          // Creating AST from file
          const lexer = new Marked.Lexer()
          const tokens = lexer.lex(fileContent)
          const headings = tokens.filter(
            (token) => 'heading' == token.type && 1 == token.depth
          )
          const headingsText = headings.map((heading) => heading.text)

          let searchFail = ''
          let noFail = true
          for (let i = 0; i < searchArray.length; i++) {
            pass = headingsText.includes(searchArray[i].text)
            if (false == pass) {
              noFail = false
              searchFail += '_"' + searchArray[i].text + '"'
            }
          }
          if (!noFail) {
            pass = noFail
          }
          why = 'heading(s)' + searchFail + '__not__found'
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
        let why = 'file__' + file + '__not__found'
        if (true == pass) {
          why = 'file__' + file + '__found'

          let searchArray = checkDetails.contains

          let fileContent = dataForChecks[file]
          // Creating AST from file
          const lexer = new Marked.Lexer()
          const tokens = lexer.lex(fileContent)
          const headings = tokens.filter(
            (token) => 'heading' == token.type && 2 == token.depth
          )
          const headingsText = headings.map((heading) => heading.text)

          let searchFail = ''
          let noFail = true
          for (let i = 0; i < searchArray.length; i++) {
            pass = headingsText.includes(searchArray[i].text)
            if (false == pass) {
              noFail = false
              searchFail += '_"' + searchArray[i].text + '"'
            }
          }
          if (!noFail) {
            pass = noFail
          }
          why = 'heading(s)' + searchFail + '__not__found'
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
        let why = 'file__' + file + '__not__found'

        if (true == pass) {
          const fileContent = dataForChecks[file]

          for (let i = 0; i < searchContent.length; i++) {
            pass = fileContent.includes(searchContent[i])
          }

          if (true == pass) {
            why = 'content__found'
          } else {
            why = 'content__not__found'
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

      file_exist: async function (checkDetails, dataForChecks) {
        let file = checkDetails.file
        let pass = file in dataForChecks
        let why = 'file__' + file + '__not__found'
        if (true == pass) {
          why = 'file__' + file + '__found'
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
        let why = 'file__' + file + '__not__found'
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
              why = 'file__' + fileX + '__found'
            } else {
              why = 'file__' + fileX + '__not__found'
            }
          } else {
            why = 'invalid__search__value'
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
  },
}
