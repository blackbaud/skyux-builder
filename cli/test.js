/*jslint node: true */
'use strict';

/**
 * Spawns the karma test command.
 * @name test
 */
function test(command, argv) {
  const logger = require('@blackbaud/skyux-logger');
  const Server = require('karma').Server;
  const path = require('path');
  const glob = require('glob');
  const tsLinter = require('./utils/ts-linter');
  const configResolver = require('./utils/config-resolver');
  const localeAssetsProcessor = require('../lib/locale-assets-processor');

  argv = argv || process.argv;
  argv.command = command;

  const karmaConfigUtil = require('karma').config;
  const karmaConfigPath = configResolver.resolve(command, argv);
  const karmaConfig = karmaConfigUtil.parseConfig(karmaConfigPath);
  const specsPath = path.resolve(process.cwd(), 'src/app/**/*.spec.ts');
  const specsGlob = glob.sync(specsPath);

  let lintResult;

  const onRunStart = () => {
    localeAssetsProcessor.prepareLocaleFiles();
    lintResult = tsLinter.lintSync();
  };

  const onRunComplete = () => {
    if (lintResult && lintResult.exitCode > 0) {
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
      if (lintResult) {
        exitCode = lintResult.exitCode;
      }
    }

    logger.info(`Karma has exited with ${exitCode}.`);
    process.exit(exitCode);
  };

  if (specsGlob.length === 0) {
    logger.info('No spec files located. Skipping test command.');
    return onExit(0);
  }

  const server = new Server(karmaConfig, onExit);
  server.on('run_start', onRunStart);
  server.on('run_complete', onRunComplete);
  server.start();
}

module.exports = test;
