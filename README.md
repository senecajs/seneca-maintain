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

`npm install @seneca/maintain`

## Quick Example

```
const Maintain = require('@seneca/maintain')

Maintain()
```
Currently, the above script must be placed in a file in a sub-directory in order to function correctly - we reccommend `test/maintain.test.js` if you wish to use Jest.

Run the module _from the test directory_ with the `node <filename>.js` command.

## More Examples

__Using configurations__
Configurations are used to run additional checks based on the architecture of your specific plugin. By default, if no arguments are specified, the base configuration is used.

If your plugin is written in JavaScript, run
`node <filename>.js base,js`
to avail of JS-specific checks.

If your plugin is written in TypeScript, run
`node <filename>.js base,ts`
to avail of the equivalent TS checks.

For the moment, these are the only three configs available.

## Motivation

## Support

### Check Descriptions



## API

## Contributing

## Background