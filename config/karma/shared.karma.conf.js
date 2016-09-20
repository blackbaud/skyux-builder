/*jslint node: true */
'use strict';

/**
* Common Karma configuration shared between local / CI testing.
*/
module.exports = function (config) {

  const path = require('path');
  let testWebpackConfig = require('../test.webpack.config');
  let remapIstanbul = require('remap-istanbul');
  let skyPagesConfig = require('../sky-pages.config').getSkyPagesConfig();

  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    exclude: [],
    files: [
      {
        pattern: '../../utils/spec-bundle.js',
        watched: false
      },
      // {
      //   pattern: '../utils/spec-styles.js',
      //   watched: false
      // }
    ],
    preprocessors: {
      // '../utils/spec-styles.js': ['webpack'],
      '../../utils/spec-bundle.js': ['coverage', 'webpack', 'sourcemap']
    },
    webpack: testWebpackConfig.getWebpackConfig(skyPagesConfig),
    coverageReporter: {
      dir: path.join(process.cwd(), 'coverage'),
      reporters: [
        { type: 'json' },
        { type: 'html' }
      ],
      _onWriteReport: function (collector) {
        return remapIstanbul.remap(collector.getFinalCoverage());
      }
    },
    webpackServer: {
      noInfo: true,
      stats: 'minimal'
    },
    reporters: ['mocha', 'coverage'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    singleRun: true
  });
};
