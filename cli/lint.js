function lint() {
  const tsLinter = require('./utils/ts-linter');
  const result = tsLinter.lintSync();

  process.exit(result.exitCode);
}

module.exports = lint;
