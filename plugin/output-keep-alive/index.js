/*jslint node: true */
'use strict';

/**
 * For longer builds, this plugin periodically prints to the
 * console to reset any timeouts associated with watched output.
 * More info:
 * https://docs.travis-ci.com/user/common-build-problems/#Build-times-out-because-no-output-was-received
 *
 * @name OutputKeepAlivePlugin
 * @param {any} options
 */
function OutputKeepAlivePlugin(options = {}) {
  this.apply = function (compiler) {
    if (!options.enabled) {
      return;
    }

    compiler.plugin('compilation', function (compilation) {
      // More hooks found on the docs:
      // https://webpack.js.org/api/compilation/
      compilation.plugin('build-module', function () {
        process.stdout.write('.');
      });
    });
  };
}

module.exports = { OutputKeepAlivePlugin };
