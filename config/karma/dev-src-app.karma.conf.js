/*jshint node: true*/
'use strict';

/**
 * Requires the shared karma config and sets any local properties.
 * @name getConfig
 * @param {Object} config
 */
function getConfig(config) {

  const path = require('path');

  const testWebpackConfig = require('../webpack/test.webpack.config');
  const skyPagesConfigUtil = require('../sky-pages/sky-pages.config');
  const testKarmaConf = require('./test.karma.conf');

  const runtimePath = path.resolve(process.cwd(), 'runtime');
  const srcPath = path.resolve(process.cwd(), 'src', 'app');
  const skyPagesConfig = skyPagesConfigUtil.getSkyPagesConfig('test');
  let webpackConfig = testWebpackConfig.getWebpackConfig(skyPagesConfig);

  // Import shared karma config
  testKarmaConf(config);

  // Adjust the loader src path.
  webpackConfig.module.rules[webpackConfig.module.rules.length - 1].include = srcPath;

  // This is needed exclusively for internal runtime unit tests,
  // which is why it's here instead of alias-builder or the shared test.webpack.config.js
  // It's relative from src/app/
  webpackConfig.resolve.alias['@blackbaud/skyux-builder/runtime'] = runtimePath;

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
