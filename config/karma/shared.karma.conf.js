/*jslint node: true */
'use strict';

const logger = require('@blackbaud/skyux-logger');

/**
 * Adds the necessary configuration for code coverage thresholds.
 * @param {*} config
 */
function getCoverageThreshold(skyPagesConfig) {
  switch (skyPagesConfig.skyux.codeCoverageThreshold) {
    case 'none':
      return 0;

    case 'standard':
      return 80;

    case 'strict':
      return 100;
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
  const srcPath = path.join(process.cwd(), 'src');

  let testWebpackConfig = require('../webpack/test.webpack.config');
  let remapIstanbul = require('remap-istanbul');

  const utils = require('istanbul').utils;

  // See minimist documentation regarding `argv._` https://github.com/substack/minimist
  let skyPagesConfig = require('../sky-pages/sky-pages.config').getSkyPagesConfig(argv._[0]);

  // Using __dirname so this file can be extended from other configuration file locations
  const specBundle = `${__dirname}/../../utils/spec-bundle.js`;
  const specStyles = `${__dirname}/../../utils/spec-styles.js`;
  let preprocessors = {};

  preprocessors[specBundle] = ['coverage', 'webpack', 'sourcemap'];
  preprocessors[specStyles] = ['webpack'];

  let remapCoverageSummary;

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
      reporters: [
        { type: 'json' },
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcov' },
        { type: 'in-memory' }
      ],
      _onWriteReport: function (collector) {
        const newCollector = remapIstanbul.remap(collector.getFinalCoverage());

        if (!remapCoverageSummary) {
          // Cache the remapped coverage summary so we can evaluate it in the _onExit() hook.
          let summaries = [];

          newCollector.files().forEach((file) => {
            summaries.push(
              utils.summarizeFileCoverage(
                newCollector.fileCoverageFor(file)
              )
            );
          });

          remapCoverageSummary = utils.mergeSummaryObjects.apply(null, summaries);
        }

        return newCollector;
      },

      _onExit: function (done) {
        const threshold = getCoverageThreshold(skyPagesConfig);

        if (threshold) {
          // The karma-coverage library does not use the coverage summary from the remapped source
          // code, so its built-in code coverage check uses numbers that don't match what's reported
          // to the user.  This will use the coverage summary generated from the remapped source code.
          var keys = [
            'statements',
            'branches',
            'lines',
            'functions'
          ];

          const threshold = getCoverageThreshold(skyPagesConfig);

          let coverageFailed;

          keys.forEach(function (key) {
            var actual = remapCoverageSummary[key].pct;

            if (actual < threshold) {
              coverageFailed = true;
              logger.error(
                `Coverage for ${key} (${actual}%) does not meet global threshold (${threshold}%)`
              );
            }
          });

          if (coverageFailed) {
            logger.info(`Karma has exited with 1.`);
            process.exit(1);
          }
        }

        done();
      }
    },
    webpackServer: {
      noInfo: true,
      stats: 'minimal'
    },

    // This is necessary to stop endless test runs for skyux watch.
    // Without it, the coverage reports and .skypageslocales files will
    //  trigger the `invalid` event, causing karma to constantly re-rerun
    //  the tests.  This is a by-product of using `require.context`.
    // https://github.com/webpack-contrib/karma-webpack/issues/253#issuecomment-335545430
    // By using require.context in our @skyux/i18n library ALL project files are watched by default.
    // The function below ignores all files execpt the `src` directory.
    webpackMiddleware: {
      watchOptions: {
        // Returning `true` means the file should be ignored.
        // Fat-Arrow functions do not work as chokidar will inspect this method.
        ignored: function (item) {
          const resolvedPath = path.resolve(item);
          const ignore = (resolvedPath.indexOf(srcPath) === -1);
          return ignore;
        }
      }
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
