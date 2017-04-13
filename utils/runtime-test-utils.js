/*jslint node: true */
'use strict';

const merge = require('merge');

module.exports = {
  getDefaultRuntime: function (runtime) {
    return merge.recursive({
      app: {
        base: '',
        inject: false,
        template: ''
      },
      command: '',
      componentsPattern: '**/*.component.ts',
      routes: [],
      routesPattern: '**/index.html',
      runtimeAlias: 'sky-pages-internal/runtime',
      srcPath: 'src/app/',
      spaPathAlias: 'sky-pages-spa',
      skyPagesOutAlias: 'sky-pages-internal',
      skyuxPathAlias: '@blackbaud/skyux/dist',
      useTemplateUrl: false
    }, runtime);
  }
};
