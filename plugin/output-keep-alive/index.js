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
    let done = false;

    if (!options.enabled) {
      return;
    }

    const check = () => {
      if (done) {
        return;
      }

      setImmediate(() => {
        process.stdout.write('.');
        check();
      });
    };

    check();

    compiler.plugin('done', function () {
      done = true;
    });
  };
}

module.exports = { OutputKeepAlivePlugin };
