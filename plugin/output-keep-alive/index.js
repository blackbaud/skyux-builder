/*jslint node: true */
'use strict';

function OutputKeepAlivePlugin(options = {}) {
  const printDot = () => process.stdout.write('.');

  this.apply = function (compiler) {
    if (!options.enabled) {
      return;
    }

    compiler.plugin('compile', () => printDot());
    compiler.plugin('compilation', (compilation) => {
      printDot();
      compilation.plugin('after-optimize-modules', () => printDot());
      compilation.plugin('build-module', () => printDot());
      compilation.plugin('module-asset', () => printDot());
    });
  };
}

module.exports = OutputKeepAlivePlugin;
