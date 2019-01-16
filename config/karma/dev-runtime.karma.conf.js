/*jshint node: true*/
'use strict';

function addRuntimeAlias(webpackConfig, runtimePath, path) {
  webpackConfig.resolve.alias['@skyux-sdk/builder/runtime' + path] = runtimePath + path;
}

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

  // Import shared karma config
  testKarmaConf(config);

  // First DefinePlugin wins so we want to override the normal src/app/ value in ROOT_DIR
  webpackConfig.plugins.unshift(
    new DefinePlugin({
      'ROOT_DIR': JSON.stringify(runtimePath)
    })
  );

  // Adjust the loader src path.
  webpackConfig.module.rules[webpackConfig.module.rules.length - 1].include = runtimePath;

  // This is needed exclusively for internal runtime unit tests,
  // which is why it's here instead of alias-builder or the shared test.webpack.config.js
  addRuntimeAlias(webpackConfig, runtimePath, '');
  addRuntimeAlias(webpackConfig, runtimePath, '/i18n');

  // Remove sky-style-loader
  delete config.preprocessors['../../utils/spec-styles.js'];
  config.files.pop();

  config.set({
    webpack: webpackConfig,
    coverageReporter: {
      dir: path.join(process.cwd(), 'coverage', 'runtime')
    }
  });
}

module.exports = getConfig;
