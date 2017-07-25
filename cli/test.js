/*jslint node: true */
'use strict';

/**
 * Spawns the karma test command.
 * @name test
 */
function test(command, argv) {
  const logger = require('../utils/logger');
  const Server = require('karma').Server;
  const tsLinter = require('./utils/ts-linter');
  const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');

  argv = argv || process.argv;
  argv.command = command;

  const karmaConfigUtil = require('karma').config;
  const karmaConfigPath = skyPagesConfigUtil.outPath(`config/karma/${command}.karma.conf.js`);
  const karmaConfig = karmaConfigUtil.parseConfig(karmaConfigPath);

  let lintResult;

  const onExit = (exitCode) => {
    // Only set exit code if it's a failure.
    if (exitCode === 0) {
      exitCode = lintResult.exitCode;
    }

    logger.info(`Karma has exited with ${exitCode}.`);
    process.exit(exitCode);
  };

  const onRunStart = () => {
    lintResult = tsLinter.lintSync();
    logger.info(lintResult.message);
    if (lintResult.errors) {
      lintResult.errors.forEach(error => logger.error(error));
    }
  };

  const onRunComplete = () => {
    if (lintResult.errorCode > 0) {
      logger.error(lintResult.message);
    }
  };

  const server = new Server(karmaConfig, onExit);
  server.on('run_start', onRunStart);
  server.on('run_complete', onRunComplete);
  server.start();
}

module.exports = test;
