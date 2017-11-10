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
  const printDot = () => process.stdout.write('.');

  this.apply = function (compiler) {
    if (!options.enabled) {
      return;
    }

    compiler.plugin('compilation', function (compilation) {
      printDot();

      compilation.plugin('after-optimize-modules', function () {
        printDot();
      });

      compilation.plugin('build-module', function () {
        printDot();
      });
    });
  };
}

module.exports = { OutputKeepAlivePlugin };
