![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> Run standardisation tests on your [Seneca.js](https://www.npmjs.com/package/seneca) plugin.

# seneca-maintain

| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
|---|---|

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
$ seneca-maintain
```

Run the above command from the directory of the plugin you wish to test. Below is a sample of the result you may recieve, in this case with two failed checks.

```txt
Running standardisation checks on your plugin...
Configuration :  [ 'base' ]
Process complete.
Total checks for this configuration: 8

Failed checks: 2
    exist_codeconduct (why: file not found)
    version_codeconduct (why: file not found)
    
Please refer to the README.md document for descriptions of all checks. 
```

## More Examples

__Using configurations__

Configurations are used to run additional checks based on the architecture of your specific plugin. By default, if no arguments are specified, the base configuration is used.

If your plugin is written in JavaScript, run

`$ seneca-maintain base,js` to avail of JS-specific checks.

If your plugin is written in TypeScript, run

`$ seneca-maintain base,ts` to avail of the equivalent TS checks.

For the moment, these are the only three configs available.

## Motivation

## Support

### Check Descriptions

| Name | Description |
|---|---|
| __content_readme__ | Your README.md file should contain the word "Voxgig" somewhere in it. [Voxgig](https://www.voxgig.com) are the sponsors and supporters of many Seneca modules. |
| __exist_codeconduct__ | Your plugin should contain a CODE_OF_CONDUCT.md file. Please refer to [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) for further details.
| __exist_dist__ | This is a TypeScript configuration check. Your plugin should contain a top-level file named `<plugin>.ts`, where <plugin> matches `"main": "dist/<plugin>.js"` in your package.json. Eg: a file named `maintain.ts` and a package.json main value of `dist/maintain.js`. Instances where <plugin> is equal to "index" are not accepted. |
| __exist_entry__ | This is a JavaScript configuration check. Your plugin should contain a top-level file named `<plugin>.js`, where <plugin> matches `"main": "<plugin>.js"` in your package.json. Eg: a file named `maintain.js` and a package.json main value of `maintain.js`. Instances where <plugin> is equal to "index" are not accepted. |
| __exist_license__ | Your plugin should include a license file, simply named `LICENSE` - no file extension. |
| __exist_pkgjson__ | Your plugin should include a package.json file, at the top-level. This check simply scans for its existence. |
| __exist_readme__ | Your plugin should contain a README.md file at the top level, named exactly `README.md`. |
| __readme_headings__ | Your README.md file should contain only one H1-level heading (denoted by a single hash (`#`) in Markdown), the value of which should be `<package.name>`, where `<package.name>` is the name taken from the "name" value in the package.json file. Additionally, your README.md file should contain eight and only eight H2-level headings (denoted by a double-hash (`##`) in Markdown). The values of these H2 headings should be the following (order must be conserved): Install, Quick Example, More Examples, Motivation, Support, API, Contributing, Background. You may include as many lower-level headings between these as you wish. This README.md document passes this check - refer to it if needed. |
| __test_pkgjson__ | Your package.json file should include a `scripts.test` key, or a key named "test" nested within the "scripts" value. The value of this key is up to you. |
| __version_codeconduct__ | Your CODE_OF_CONDUCT.md file should contain the latest version of Contributor Covenant's Code of Conduct, as denoted [here](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). |

## API

## Contributing

## Background