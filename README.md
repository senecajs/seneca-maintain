![Seneca](http://senecajs.org/files/assets/seneca-logo.png)

> Run standardisation tests on your [Seneca.js](https://www.npmjs.com/package/seneca) plugin.

# seneca-maintain

| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------- |

This module is designed for contributors to the Seneca family of plugins. If you wish, you may make use of this to scan your own plugin prior to publishing to see if it meets our standardisation specifications.

If you're using this module, and need help, you can:

- Post a [github issue](https://github.com/senecajs/repo-maintain/issues),
- Tweet to [@senecajs](http://twitter.com/senecajs),
- Ask the [author](https://github.com/stokesriona).

If you are new to Seneca in general, please take a look at [senecajs.org](https://www.npmjs.com/package/seneca). We have everything from tutorials to sample apps to help get you up and running quickly.

## Install

~~`npm install @seneca/maintain`~~
Version 1.0 of this package is pending - the package on [NPM](https://www.npmjs.org) does not yet include the functionalities you see described here. Please wait until the release of 1.0 before installing, and check back regularly for updates.

## Quick Example

```bash
$ cli-maintain
```

Run the above command from the directory of the plugin you wish to test. Below is a sample of the result you may recieve, in this case with two failed checks.

```txt
Total checks for this configuration: 8

Failed checks: 2
    exist_codeconduct (why: file not found)
    version_codeconduct (why: file not found)

Please refer to the README.md document for descriptions of all checks.
https://github.com/senecajs/seneca-maintain/blob/main/README.md
```

## More Examples

### Configurations

Configurations are used to run additional checks based on the architecture of your specific plugin. At the moment, we have three configs - Base, JavaScript, and TypeScript. The base configuration is run by default, and the tool will apply language specific configurations based on the language of each plugin. No action on your part is necessary.

## Motivation

## Support

Check out our sponsors and supporters, Voxgig, on their website [here](https://www.voxgig.com).

### Check Descriptions

| Name                    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **content_readme**      | Your README.md file should contain the word "Voxgig" somewhere in it. [Voxgig](https://www.voxgig.com) are the sponsors and supporters of many Seneca modules.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **exist_codeconduct**   | Your plugin should contain a CODE_OF_CONDUCT.md file. Please refer to [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) for further details.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **exist_dist**          | This is a TypeScript configuration check. Your plugin should contain a top-level file named `<plugin>.ts`, where <plugin> matches `"main": "dist/<plugin>.js"` in your package.json. Eg: a file named `maintain.ts` and a package.json main value of `dist/maintain.js`. Instances where <plugin> is equal to "index" are not accepted.                                                                                                                                                                                                                                                                                                                                                                            |
| **exist_entry**         | This is a JavaScript configuration check. Your plugin should contain a top-level file named `<plugin>.js`, where <plugin> matches `"main": "<plugin>.js"` in your package.json. Eg: a file named `maintain.js` and a package.json main value of `maintain.js`. Instances where <plugin> is equal to "index" are not accepted.                                                                                                                                                                                                                                                                                                                                                                                      |
| **exist_license**       | Your plugin should include a license file, simply named `LICENSE` - no file extension.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **exist_pkgjson**       | Your plugin should include a package.json file, at the top-level. This check simply scans for its existence.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **exist_readme**        | Your plugin should contain a README.md file at the top level, named exactly `README.md`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **readme_headings**     | Your README.md file should contain only one H1-level heading (denoted by a single hash (`#`) in Markdown), the value of which should be `<package.name>`, where `<package.name>` is the name taken from the "name" value in the package.json file. Additionally, your README.md file should contain eight and only eight H2-level headings (denoted by a double-hash (`##`) in Markdown). The values of these H2 headings should be the following (order must be conserved): Install, Quick Example, More Examples, Motivation, Support, API, Contributing, Background. You may include as many lower-level headings between these as you wish. This README.md document passes this check - refer to it if needed. |
| **test_pkgjson**        | Your package.json file should include a `scripts.test` key, or a key named "test" nested within the "scripts" value. The value of this key is up to you.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **check_default**       | Your default branch should be named `main`, and not `master`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **version_codeconduct** | Your CODE_OF_CONDUCT.md file should contain the latest version of Contributor Covenant's Code of Conduct, as denoted [here](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

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
