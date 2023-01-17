module.exports = {
  checkList: {
    check_default: {
      include_orgRepo: [/.*/],
      exclude_orgRepo: [/.^/],
      class: 'primary',
      secondary: null,
      config: 'base',
      kind: 'check_branch',
      file: 'config',
      branch: '[branch "main"]',
    },

    content_readme: {
      include_orgRepo: [/.*/],
      exclude_orgRepo: [/.^/],
      class: 'primary',
      secondary: null,
      config: 'base',
      kind: 'content_contain_string',
      file: 'README.md',
      contains: ['Voxgig'],
    },

    content_gitignore: {
      include_orgRepo: [/.*/],
      exclude_orgRepo: [/.^/],
      class: 'primary',
      secondary: null,
      config: 'base',
      kind: 'content_contain_string',
      file: '.gitignore',
      contains: ['package-lock.json'],
    },

    exist_codeconduct: {
      include_orgRepo: [/.*/],
      exclude_orgRepo: [/.^/],
      class: 'primary',
      secondary: null,
      config: 'base',
      kind: 'file_exist',
      file: 'CODE_OF_CONDUCT.md',
    },

    exist_dist: {
      include_orgRepo: [/.*/],
      exclude_orgRepo: [/.^/],
      class: 'primary',
      secondary: null,
      config: 'ts',
      kind: 'fileX_exist_if_contain_json',
      fileX: '404',
      file: 'package.json',
      contains: ['main'],
      contains_type: 'key',
      contains_is_not: 'dist/index.js',
    },

    exist_entry: {
      include_orgRepo: [/.*/],
      exclude_orgRepo: [/.^/],
      class: 'primary',
      secondary: null,
      config: 'js',
      kind: 'fileX_exist_if_contain_json',
      fileX: '404',
      file: 'package.json',
      contains: ['main'],
      contains_type: 'key',
      contains_is_not: 'index.js',
    },

    exist_license: {
      include_orgRepo: [/.*/],
      exclude_orgRepo: [/.^/],
      class: 'primary',
      secondary: null,
      config: 'base',
      kind: 'file_exist',
      file: 'LICENSE',
    },

    exist_pkgjson: {
      include_orgRepo: [/.*/],
      exclude_orgRepo: [/.^/],
      class: 'primary',
      secondary: null,
      config: 'base',
      kind: 'file_exist',
      file: 'package.json',
    },

    exist_readme: {
      include_orgRepo: [/.*/],
      exclude_orgRepo: [/.^/],
      class: 'primary',
      secondary: null,
      config: 'base',
      kind: 'file_exist',
      file: 'README.md',
    },

    readme_title: {
      include_orgRepo: [/.*/],
      exclude_orgRepo: [/.^/],
      class: 'primary',
      secondary: null,
      config: 'base',
      kind: 'content_contain_jsonX_in_markdown',
      file: 'README.md',
      contains: { type: 'heading', depth: 1, text: '<packagename>' },
      jsonFile: 'package.json',
      jsonContains: 'name',
      jsonContains_type: 'value',
    },

    readme_headings: {
      include_orgRepo: [/.*/],
      exclude_orgRepo: [/.^/],
      class: 'primary',
      secondary: null,
      config: 'base',
      kind: 'content_contain_markdown',
      file: 'README.md',
      contains: [
        { type: 'heading', depth: 2, text: 'Install' },
        { type: 'heading', depth: 2, text: 'Quick Example' },
        { type: 'heading', depth: 2, text: 'More Examples' },
        { type: 'heading', depth: 2, text: 'Motivation' },
        { type: 'heading', depth: 2, text: 'Support' },
        { type: 'heading', depth: 2, text: 'API' },
        { type: 'heading', depth: 2, text: 'Contributing' },
        { type: 'heading', depth: 2, text: 'Background' },
      ],
    },

    scoped_package: {
      include_orgRepo: [/senecajs/],
      exclude_orgRepo: [/.^/],
      class: 'primary',
      secondary: null,
      config: 'base',
      kind: 'content_contain_json',
      file: 'package.json',
      contains_key: ['name'],
      contains_value: '@seneca/',
      contains_type: 'value',
    },

    // senecajs_package: {
    //   include_orgRepo: [/.*/],
    //   exclude_orgRepo: [/.^/],
    //   class: 'secondary',
    //   secondary: null,
    //   config: 'base',
    //   kind: 'content_contain_json',
    //   file: 'package.json',
    //   contains_key: ['repository', 'url'],
    //   contains_value: 'github.com/senecajs/',
    //   contains_type: 'value',
    // },

    test_pkgjson: {
      include_orgRepo: [/.*/],
      exclude_orgRepo: [/.^/],
      class: 'primary',
      secondary: null,
      config: 'base',
      kind: 'content_contain_json',
      file: 'package.json',
      contains_key: ['scripts', 'test'],
      contains_type: 'key',
    },

    url_pkgjson: {
      include_orgRepo: [/.*/],
      exclude_orgRepo: [/.^/],
      class: 'primary',
      secondary: null,
      config: 'base',
      kind: 'content_contain_json',
      file: 'package.json',
      contains_key: ['repository', 'url'],
      contains_type: 'key',
    },

    version_codeconduct: {
      include_orgRepo: [/.*/],
      exclude_orgRepo: [/.^/],
      class: 'primary',
      secondary: null,
      config: 'base',
      kind: 'content_contain_string',
      file: 'CODE_OF_CONDUCT.md',
      contains: [
        'version 2.1',
        'https://www.contributor-covenant.org/version/2/1/',
      ],
    },
  },
}
