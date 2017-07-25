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

  let lintExitCode = 0;

  const onRunStart = () => {
    lintExitCode = tsLinter.lintSync();
  };

  const onRunComplete = () => {
    if (lintExitCode > 0) {
      // Pull the logger out of the execution stream to let it print
      // after karma's coverage reporter.
      setTimeout(() => {
        logger.error(`Process failed due to linting errors.`);
      }, 10);
    }
  };

  const onExit = (exitCode) => {
    if (exitCode === 0) {
      exitCode = lintExitCode;
    }

    logger.info(`Karma has exited with ${exitCode}.`);
    process.exit(exitCode);
  };

  const server = new Server(karmaConfig, onExit);
  server.on('run_start', onRunStart);
  server.on('run_complete', onRunComplete);
  server.start();
}

module.exports = test;
