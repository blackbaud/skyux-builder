/*jshint node: true*/
'use strict';

const logger = require('winston');
const buildConfig = require('../config/webpack/build.webpack.config');

/**
 * Executes the build command.
 * @name build
 */
const build = (argv, skyPagesConfig, webpack) => {
  const config = buildConfig.getWebpackConfig(skyPagesConfig);
  const compiler = webpack(config);

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

    logger.info(stats.toString('normal'));
  });
};

module.exports = build;
