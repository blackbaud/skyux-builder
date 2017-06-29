/*jshint node: true*/
'use strict';

function SkyTsLintCheckerPlugin() {
  let isWatchMode = false;

  const apply = (compiler) => {
    compiler.plugin('run', function (params, callback) {
      isWatchMode = false;
      callback();
    });

    compiler.plugin('watch-run', function (params, callback) {
      isWatchMode = true;
      callback();
    });

    compiler.plugin('emit', function (compilation, callback) {
      if (isWatchMode === true) {
        require('./program').clearProgram();
      }

      callback();
    });
  };

  return {
    apply
  };
}

module.exports = SkyTsLintCheckerPlugin;
