/*jshint node: true*/
'use strict';

const logger = require('@blackbaud/skyux-logger');
const runBuild = require('./utils/run-build');

/**
 * Executes the build command.
 * @name build
 * @param {*} skyPagesConfig
 * @param {*} webpack
 * @param {*} isAot
 * @param {*} cancelProcessExit
 */
function build(argv, skyPagesConfig, webpack) {
  return runBuild(argv, skyPagesConfig, webpack)
    .then(() => {
      logger.info('Build successfully completed.');
    })
    .catch(err => {
      logger.error(err);
      process.exit(1);
    });
}

module.exports = build;
