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

    // Set stdout to be synchronous, to avoid a memory heap issue:
    // https://github.com/nodejs/node/issues/1741
    // compiler.plugin('after-plugins', function () {
    //   process.stdout._handle.setBlocking(true);
    // });

    compiler.plugin('compilation', function (compilation) {
      printDot();

      // More hooks found on the docs:
      // https://webpack.js.org/api/compilation/
      const hooks = [
        // 'after-optimize-modules',
        'build-module'
      ];

      hooks.forEach((hook) => {
        compilation.plugin(hook, function () {
          printDot();
        });
      });
    });

    // compiler.plugin('done', function () {
    //   process.stdout._handle.setBlocking(false);
    // });
  };
}

module.exports = { OutputKeepAlivePlugin };
