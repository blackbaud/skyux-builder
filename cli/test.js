/*jslint node: true */
'use strict';

/**
 * Spawns the karma test command.
 * @name test
 */
function test(command, argv) {
  const logger = require('winston');
  const Server = require('karma').Server
  const tsLinter = require('./utils/ts-linter');
  const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');

  const karmaConfigUtil = require('karma').config;
  const karmaConfigPath = skyPagesConfigUtil.outPath(`config/karma/${command}.karma.conf.js`);
  const karmaConfig = karmaConfigUtil.parseConfig(karmaConfigPath);

  let _exitCode = 0;
  const onExit = (exitCode) => {
    // Only set exit code if it's a failure.
    if (exitCode === 0) {
      exitCode = _exitCode;
    }

    logger.info(`Karma has exited with ${exitCode}.`);
    process.exit(exitCode);
  };

  const onRunStart = () => {
    _exitCode = tsLinter.lintSync();
  };

  const server = new Server(karmaConfig, onExit);
  server.on('run_start', onRunStart);
  server.start();
}

module.exports = test;
