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

      // More hooks found on the docs:
      // https://webpack.js.org/api/compilation/
      const hooks = [
        'after-optimize-modules',
        'build-module'
      ];

      hooks.forEach((hook) => {
        compilation.plugin(hook, function () {
          printDot();
        });
      });
    });
  };
}

module.exports = { OutputKeepAlivePlugin };
