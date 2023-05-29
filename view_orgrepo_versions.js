const Filehound = require('filehound')

async function printGitURLs() {
  const pathList = await Filehound.create()
    .paths('../notes/local-seneca-data/', '../notes/local-seneca-data/@seneca/')
    .match(['package.json'])
    .depth(0)
    .find()

  let hp = []
  let totalhp = 0
  let nohp = 0
  let ru = []
  pathList.forEach((path) => {
    let pkg = require(path)
    if (null != pkg.homepage) {
      hp.push(pkg.homepage)
      totalhp++
    } else {
      hp.push('no hp')
      totalhp++
      nohp++
    }
    if (pkg.repository?.url) {
      ru.push(pkg.repository.url)
    } else {
      hp.push('no ru')
    }
  })
  console.log(hp)
  console.log('totalhp:' + totalhp + ' vs nohp:' + nohp)
  console.log(ru)
}

printGitURLs()
