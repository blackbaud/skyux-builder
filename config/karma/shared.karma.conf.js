/*jslint node: true */
'use strict';

/**
 * Common Karma configuration shared between local / CI testing.
 * @name getConfig
 */
function getConfig(config) {

  const path = require('path');
  let testWebpackConfig = require('../webpack/test.webpack.config');
  let remapIstanbul = require('remap-istanbul');
  let skyPagesConfig = require('../sky-pages/sky-pages.config').getSkyPagesConfig();

  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    exclude: [],
    files: [
      {
        pattern: '../../utils/spec-bundle.js',
        watched: false
      }
    ],
    preprocessors: {
      '../../utils/spec-bundle.js': ['coverage', 'webpack', 'sourcemap']
    },
    webpack: testWebpackConfig.getWebpackConfig(skyPagesConfig),
    coverageReporter: {
      dir: path.join(process.cwd(), 'coverage'),
      reporters: [
        // these reporters are incompatible with `istanbul-instrumenter-loader v1.0.0`
        // use `v0.2.0` instead if you need to use these reporters
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
}

module.exports = getConfig;
