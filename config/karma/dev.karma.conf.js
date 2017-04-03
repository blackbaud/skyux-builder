/*jshint node: true*/
'use strict';

/**
 * Requires the shared karma config and sets any local properties.
 * @name getConfig
 * @param {Object} config
 */
function getConfig(config) {

  const path = require('path');

  const DefinePlugin = require('webpack/lib/DefinePlugin');
  const testWebpackConfig = require('../webpack/test.webpack.config');
  const skyPagesConfigUtil = require('../sky-pages/sky-pages.config');
  const testKarmaConf = require('./test.karma.conf');

  const runtimePath = path.resolve(process.cwd(), 'runtime');
  const skyPagesConfig = skyPagesConfigUtil.getSkyPagesConfig('test');
  let webpackConfig = testWebpackConfig.getWebpackConfig(skyPagesConfig);

  // First DefinePlugin wins so we want to override the normal src/app/ value in ROOT_DIR
  webpackConfig.plugins.unshift(
    new DefinePlugin({
      'ROOT_DIR': JSON.stringify(runtimePath)
    })
  );

  // Adjust the loader src path.
  webpackConfig.module.rules[webpackConfig.module.rules.length - 1].include = runtimePath;

  testKarmaConf(config);
  config.set({
    webpack: webpackConfig,
    coverageReporter: {
      dir: path.join(process.cwd(), 'coverage-runtime')
    }
  });
}

module.exports = getConfig;
