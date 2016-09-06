/*jshint node: true*/
'use strict';

const fs = require('fs');
const open = require('open');
const path = require('path');
const util = require('util');
const logger = require('winston');
const buildConfig = require('../webpack/build.config');
const packageJson = require('../../package.json');

/**
 * Executes the build command.
 * @name build
 */
const build = (argv, webpack) => {
  const config = buildConfig.getWebpackConfig();
  const compiler = webpack(config);

  logger.verbose(config);
  compiler.run((err, stats) => {
    if (err) {
      logger.error(err);
      return;
    }

    const jsonStats = stats.toJson();
    if (jsonStats.errors.length) {
      logger.error(stats.errors);
    }
    
    if (jsonStats.warnings.length) {
      logger.warn(stats.warnings);
    }
  });
};

module.exports = build;
