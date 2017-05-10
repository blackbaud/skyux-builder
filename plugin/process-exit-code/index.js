/*jslint node: true */
'use strict';

/**
 * This function is inspired from webpack-fail-plugin, which has been deprecated.
 * Unfortunately, webpack does not correctly return a non-zero exit code unless using their CLI.
 */
module.exports = function processExitCode() {
  let isWatch = true;

  this.plugin('run', (compiler, callback) => {
    isWatch = false;
    callback.call(compiler);
  });

  this.plugin('done', stats => {
    if (stats.compilation.errors && stats.compilation.errors.length && !isWatch) {
      process.on('beforeExit', () => process.exit(1));
    }
  });

};
