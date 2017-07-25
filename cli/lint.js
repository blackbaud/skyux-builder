/*jslint node: true */
'use strict';

function lint() {
  const logger = require('./utils/logger');
  const tsLinter = require('./utils/ts-linter');
  const result = tsLinter.lintSync();

  logger.info(result.message);

  if (result.exitCode > 0) {
    result.errors.forEach(error => logger.error(error));
  }

  process.exit(result.exitCode);
}

module.exports = lint;
