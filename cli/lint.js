/*jslint node: true */
'use strict';

function lint() {
  const tsLinter = require('./utils/ts-linter');
  const exitCode = tsLinter.lintSync();
  process.exit(exitCode);
}

module.exports = lint;
