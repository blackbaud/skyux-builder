/*jslint node: true */
'use strict';

const merge = require('merge');

module.exports = {
  getDefault: function (runtime, skyux) {
    return {
      runtime: this.getDefaultRuntime(runtime),
      skyux: this.getDefaultSkyux(skyux)
    };
  },

  getDefaultRuntime: function (runtime) {
    return merge.recursive({
      app: {
        base: '',
        inject: false,
        template: ''
      },
      command: '',
      componentsPattern: '**/*.component.ts',
      componentsIgnorePattern: './public/**/*',
      includeRouteModule: true,
      routes: [],
      routesPattern: '**/index.html',
      runtimeAlias: 'sky-pages-internal/runtime',
      srcPath: 'src/app/',
      spaPathAlias: 'sky-pages-spa',
      skyPagesOutAlias: 'sky-pages-internal',
      skyuxPathAlias: '@blackbaud/skyux/dist',
      useTemplateUrl: false
    }, runtime);
  },

  getDefaultSkyux: function (skyux) {
    return merge.recursive({
      host: {
        url: ''
      },
      mode: '',
      params: [
        'envid',
        'svcid'
      ]
    }, skyux);
  }
};
