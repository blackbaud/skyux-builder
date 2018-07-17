/*jslint node: true */
'use strict';

const logger = require('@blackbaud/skyux-logger');

/**
 * Adds the necessary configuration for code coverage thresholds.
 * @param {*} config
 */
function getCoverageThreshold(skyPagesConfig) {

  function getProperty(threshold) {
    return {
      global: {
        statements: threshold,
        branches: threshold,
        functions: threshold,
        lines: threshold
      }
    };
  }

  switch (skyPagesConfig.skyux.codeCoverageThreshold) {
    case 'none':
      return getProperty(0);

    case 'standard':
      return getProperty(80);

    case 'strict':
      return getProperty(100);
  }
}

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

  // See minimist documentation regarding `argv._` https://github.com/substack/minimist
  let skyPagesConfig = require('../sky-pages/sky-pages.config').getSkyPagesConfig(argv._[0]);

  // Using __dirname so this file can be extended from other configuration file locations
  const specBundle = `${__dirname}/../../utils/spec-bundle.js`;
  const specStyles = `${__dirname}/../../utils/spec-styles.js`;
  let preprocessors = {};

  preprocessors[specBundle] = ['coverage', 'webpack', 'sourcemap'];
  preprocessors[specStyles] = ['webpack'];

  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    exclude: [],
    files: [
      {
        pattern: specBundle,
        watched: false
      },
      {
        pattern: specStyles,
        watched: false
      }
    ],
    preprocessors: preprocessors,
    skyPagesConfig: skyPagesConfig,
    webpack: testWebpackConfig.getWebpackConfig(skyPagesConfig, argv),
    coverageReporter: {
      dir: path.join(process.cwd(), 'coverage'),
      check: getCoverageThreshold(skyPagesConfig),
      reporters: [
        { type: 'json' },
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcov' }
      ],
      _onWriteReport: function (collector) {
        return remapIstanbul.remap(collector.getFinalCoverage());
      }
    },
    webpackServer: {
      noInfo: true,
      stats: 'minimal'
    },

    // This flag allows console.log calls to come through the cli
    browserConsoleLogOptions: {
      level: 'log'
    },
    reporters: ['mocha', 'coverage'],
    port: 9876,
    colors: logger.logColor,
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
