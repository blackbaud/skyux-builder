/*jslint node: true */
'use strict';

/**
 * Common Karma configuration shared between local / CI testing.
 * @name getConfig
 */
function getConfig(config) {

  // This file is spawned so we'll need to read the args again
  const minimist = require('minimist');
  const argv = minimist(process.argv.slice(2));

  const path = require('path');
  let testWebpackConfig = require('../webpack/test.webpack.config');
  let remapIstanbul = require('remap-istanbul');
  let skyPagesConfig = require('../sky-pages/sky-pages.config').getSkyPagesConfig(argv.command);

  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    exclude: [],
    files: [
      {
        pattern: '../../utils/spec-bundle.js',
        watched: false
      },
      {
        pattern: '../../utils/spec-styles.js',
        watched: false
      }
    ],
    preprocessors: {
      '../../utils/spec-styles.js': ['webpack'],
      '../../utils/spec-bundle.js': ['coverage', 'webpack', 'sourcemap']
    },
    webpack: testWebpackConfig.getWebpackConfig(argv, skyPagesConfig),
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
    browserDisconnectTimeout: 3e5,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 3e5,
    captureTimeout: 3e5,
    autoWatch: false,
    singleRun: true,
    failOnEmptyTestSuite: false
  });
}

module.exports = getConfig;
