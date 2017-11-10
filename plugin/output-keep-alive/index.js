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
  const getTime = () => new Date().getTime();
  this.apply = function (compiler) {
    if (!options.enabled) {
      return;
    }

    let currentTime = new Date().getTime();

    const interval = setInterval(() => {
      const diffTime = getTime() - currentTime;
      console.log(`keep-alive triggered after ${diffTime} milliseconds`);
      currentTime = getTime();
    }, 1);

    compiler.plugin('done', function () {
      clearInterval(interval);
    });
  };
}

module.exports = { OutputKeepAlivePlugin };
