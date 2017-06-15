/*jslint node: true */
'use strict';

/**
 * This function is inspired from webpack-fail-plugin, which has been deprecated.
 * Unfortunately, webpack does not correctly return a non-zero exit code unless using their CLI.
 */
function ProcessExitCode() { }

ProcessExitCode.prototype.apply = function (compiler) {
  compiler.plugin('done', stats => {
    if (stats.compilation.errors && stats.compilation.errors.length) {
      process.on('exit', () => process.exitCode = 1);
    }
  });
};

module.exports = ProcessExitCode;
