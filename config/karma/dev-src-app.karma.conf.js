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

  const srcPath = path.resolve(process.cwd(), 'src', 'app');
  const skyPagesConfig = skyPagesConfigUtil.getSkyPagesConfig('test');
  let webpackConfig = testWebpackConfig.getWebpackConfig(skyPagesConfig);

  // Import shared karma config
  testKarmaConf(config);

  // First DefinePlugin wins so we want to override the normal src/app/ value in ROOT_DIR
  webpackConfig.plugins.unshift(
    new DefinePlugin({
      'ROOT_DIR': JSON.stringify(srcPath)
    })
  );

  // Adjust the loader src path.
  webpackConfig.module.rules[webpackConfig.module.rules.length - 1].include = srcPath;

  // Instead of adding skyux2 as a dependency of skyux-builder
  webpackConfig.resolve.alias['@blackbaud/skyux/dist/css/sky.css'] =
    '../../utils/runtime-test-skyux.css';

  // Remove sky-style-loader
  delete config.preprocessors['../../utils/spec-styles.js'];
  config.files.pop();

  config.set({
    webpack: webpackConfig,
    coverageReporter: {
      dir: path.join(process.cwd(), 'coverage', 'src-app')
    }
  });
}

module.exports = getConfig;
