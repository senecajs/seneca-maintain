![Seneca](http://senecajs.org/files/assets/seneca-logo.png)

> Run standardisation tests on your [Seneca.js](https://www.npmjs.com/package/seneca) plugin.

# seneca-maintain

| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------- |

This module is designed for contributors to the Seneca family of plugins. If you wish, you may make use of this to scan your own plugin prior to publishing to see if it meets our standardisation specifications.

If you're using this module, and need help, you can:

- Post a [github issue](https://github.com/senecajs/repo-maintain/issues),
- Tweet to [@senecajs](http://twitter.com/senecajs),
- Ask the [author](https://github.com/rionastokes).

If you are new to Seneca in general, please take a look at [senecajs.org](https://www.npmjs.com/package/seneca). We have everything from tutorials to sample apps to help get you up and running quickly.

## Install

`npm install -D @seneca/maintain`

Run the above command from your plugin's root directory to [install this tool](https://www.npmjs.com/package/@seneca/maintain). The `-D` flag (alternatively `--save-dev`) marks it as a _devDependency_ - meaning it is used during development and not as part of production.

Check out the official docs on dependencies and devDependencies [here](https://docs.npmjs.com/specifying-dependencies-and-devdependencies-in-a-package-json-file).

## Quick Example

```js
const { Maintain } = require('@seneca/maintain')

Maintain()
```

This maintenance tool can be run alongside existing tests, by including the above code snippet within your test script (usually `index.test.js` or similar).

Run the script with Jest (see More Examples below), or simply with node and the path to your test file:

```bash
$ node <index.test.js>
```

On success, nothing will be printed to console, and the script will continue as normal. On a fail, the script will throw a custom error with details of what went wrong.

## More Examples

### Return pass/fail boolean

If you're only looking for a simplified output in the form of a boolean (all checks pass/at least one check has failed), then you only need to set the `returnBool` parameter to `false`.

```js
let maintainBool = await Maintain({returnBool:true})
```

### Specify path to run checks on

If for example you need to run the maintain tool on one directory from another, it's possible to specify a root path. This should be the top level of the local package to test, ie. where the package.json and README.md files reside. Note that it is possible to step up levels from the current path using the `..` syntax. A forward slash must preceed any path.

```js
let maintainBool = await Maintain({runPath:'/../path/to/package'})
```

If this optional parameter is not defined, the tool will default to running from the directory it was launched from `process.cwd()`.

### Running Custom Check List

It is possible to run only a select few checks, or to exclude certain ones, by making use of the optional parameters for the Maintain() function - an include array and an exclude array.

> include - If checks are denoted in this array, they will be the only checks run.
>
> exclude - Any checks denoted in this array will be excluded from the run.

To make use of these functionalities, simply include an object as the argument for the Maintain function - the key being the name of the array, and the value being the array of check names itself.

```js
// to only run the Code of Conduct checks
Maintain({ include: ['exist_codeconduct', 'version_codeconduct'] })

// to exclude the default branch check, but run every other check
Maintain({ exclude: ['check_default'] })
```

### Using Jest testing framework

Using the standard tool as a test suite for Jest is simple - a one line addition to your test file is all you need. In order to make use of the custom include and exclude lists however, the function call must be wrapped in an async/await block.

```js
import { Maintain } from '@seneca/maintain'

// Standard run
test('maintain', Maintain)

// With parameters
test('maintain', async () => {
  await Maintain({
    exclChecks: ['exist_codeconduct', 'version_codeconduct'],
  })
})
```

### Configurations

Configurations are used to run additional checks based on the architecture of your specific plugin. At the moment, there are three configs - Base, JavaScript, and TypeScript. The base configuration is run by default, and the tool will apply language-specific configurations based on the language of your plugin. No action on your part is necessary.

### CLI Tool (coming soon)

~~`$ cli-maintain`~~

Sample output :

```txt
Total checks for this configuration: 8

Failed checks: 2
  exist_codeconduct (why: file not found)
  version_codeconduct (why: file not found)

Please refer to the README.md document for descriptions of all checks.
https://github.com/senecajs/seneca-maintain/blob/main/README.md
```

### Check Descriptions

| Name                    | Description                                                                                                                                                                                                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **check_default**       | Your default branch should be named `main`, and not `master`.                                                                                                                                                                                                                                                                                           |
| **content_readme**      | Your README.md file should contain the word "Voxgig" somewhere in it. [Voxgig](https://www.voxgig.com) are the sponsors and supporters of many Seneca modules and plugins.                                                                                                                                                                              |
| **content_gitignore**   | Your .gitignore file should contain the string `package-lock.json`, as this file should not be shipped with production.                                                                                                                                                                                                                                 |
| **exist_codeconduct**   | Your plugin should contain a CODE_OF_CONDUCT.md file at the top level. Please refer to [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) for further details.                                                                                                                                                   |
| **exist_dist**          | This is a TypeScript configuration check. Your plugin should contain a top-level file named `<plugin>.ts`, where \<plugin\> matches `"main": "dist/<plugin>.js"` in your package.json. For example - a file named `maintain.ts` and a (package.json) main value of `dist/maintain.js`. Instances where \<plugin\> is equal to "index" are not accepted. |
| **exist_entry**         | This is a JavaScript configuration check. Your plugin should contain a top-level file named `<plugin>.js`, where \<plugin\> matches `"main": "<plugin>.js"` in your package.json. For example - a file named `maintain.js` and a (package.json) main value of `maintain.js`. Instances where \<plugin\> is equal to "index" are not accepted.           |
| **exist_license**       | Your plugin should include a license file at the top level, simply named `LICENSE` - no file extension.                                                                                                                                                                                                                                                 |
| **exist_pkgjson**       | Your plugin should include a package.json file, at the top level. This check simply scans for its existence.                                                                                                                                                                                                                                            |
| **exist_readme**        | Your plugin should contain a README.md file at the top level, named exactly `README.md`.                                                                                                                                                                                                                                                                |
| **readme_title**        | Your README.md file should contain a H1-level heading (denoted by a single hash (`#`) in Markdown), the value of which should be `<package.name>`, where `<package.name>` is the name taken from the "name" value in the package.json file.                                                                                                             |
| **readme_headings**     | Your README.md file should contain at least eight H2-level headings (denoted by a double-hash (`##`) in Markdown). The names of these H2 headings should be the following (order need not be conserved): Install, Quick Example, More Examples, Motivation, Support, API, Contributing, Background.                                                     |
| **scoped_package**      | If your plugin is an official Seneca plugin and grouped under the [SenecaJS GitHub organisation](https://github.com/senecajs), then it must be scoped as such. For example - this module named senecajs/seneca-maintain is scoped as `@seneca/maintain` in the package.json file.                                                                       |
| **test_pkgjson**        | Your package.json file should include a `scripts.test` key (a key named "test" nested within the "scripts" value). The value of this key is up to you.                                                                                                                                                                                                  |
| **version_codeconduct** | Your CODE_OF_CONDUCT.md file should contain the latest version of Contributor Covenant's Code of Conduct, as denoted [here](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).                                                                                                                                                         |

## Motivation

## Support

Check out our sponsors and supporters, Voxgig, on their website [here](https://www.voxgig.com).

## API

No API functionality is currently shipped with this tool.

## Contributing

The [SenecaJS org](http://senecajs.org/) encourages participation. If you feel you can help in any way, be
it with bug reporting, documentation, examples, extra testing, or new features, feel free
to [create an issue](https://github.com/senecajs/seneca-maintain/issues/new), or better yet - [submit a Pull Request](https://github.com/senecajs/seneca-maintain/pulls). For more
information on contribution, please see our [Contributing Guide](http://senecajs.org/contribute).

## Background

Check out the SenecaJS roadmap [here](https://senecajs.org/roadmap/)!

### License

Licensed under [MIT](./LICENSE).
