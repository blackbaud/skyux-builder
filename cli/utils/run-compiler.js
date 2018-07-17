/*jshint node: true*/
'use strict';

const logger = require('@blackbaud/skyux-logger');

const runCompiler = (webpack, config) => {
  const compiler = webpack(config);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }

      const jsonStats = stats.toJson();

      if (jsonStats.errors.length) {
        return reject(jsonStats.errors);
      }

      if (jsonStats.warnings.length) {
        logger.warn(jsonStats.warnings);
      }

      // Normal logging is handled by SimpleProgressWebpackPlugin in common.webpack.config.js
      resolve(stats);
    });
  });
};

module.exports = runCompiler;
