/*jslint node: true */
'use strict';

const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');

function getConfigPath(command, argv) {
  const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');

  if (argv.config) {
    const resolved = path.resolve(argv.config);

    if (!fs.existsSync(resolved)) {
      logger.error(`Error loading config file ${resolved}`);
      process.exit(1);
    }

    return resolved;
  } else {
    return skyPagesConfigUtil.outPath(`config/karma/${command}.karma.conf.js`);
  }
}

/**
 * Spawns the karma test command.
 * @name test
 */
function test(command, argv) {
  const karma = require('karma');
  const tsLinter = require('./utils/ts-linter');

  argv = argv || process.argv;
  argv.command = command;

  const karmaConfigPath = getConfigPath(command, argv);
  const karmaConfig = karma.config.parseConfig(karmaConfigPath);

  let lintResult;

  const onRunStart = () => {
    lintResult = tsLinter.lintSync();
  };

  const onRunComplete = () => {
    if (lintResult.exitCode > 0) {
      // Pull the logger out of the execution stream to let it print
      // after karma's coverage reporter.
      setTimeout(() => {
        logger.error('Process failed due to linting errors:');
        lintResult.errors.forEach(error => logger.error(error));
      }, 10);
    }
  };

  const onExit = (exitCode) => {
    if (exitCode === 0) {
      exitCode = lintResult.exitCode;
    }

    logger.info(`Karma has exited with ${exitCode}.`);
    process.exit(exitCode);
  };

  const server = new karma.Server(karmaConfig, onExit);
  server.on('run_start', onRunStart);
  server.on('run_complete', onRunComplete);
  server.start();
}

module.exports = test;
