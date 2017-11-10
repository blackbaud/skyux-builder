/*jslint node: true */
'use strict';

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

module.exports = OutputKeepAlivePlugin;
