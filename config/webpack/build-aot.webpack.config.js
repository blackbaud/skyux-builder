/*jslint node: true */
'use strict';

const webpackMerge = require('webpack-merge');
const { AngularCompilerPlugin } = require('@ngtools/webpack');
const skyPagesConfigUtil = require('../sky-pages/sky-pages.config');
const SaveMetadata = require('../../plugin/save-metadata');

/**
 * Returns the default webpackConfig.
 * @name getDefaultWebpackConfig
 * @returns {WebpackConfig} webpackConfig
 */
function getWebpackConfig(skyPagesConfig, argv) {
  const common = require('./common.webpack.config');

  // Webpackmege will attempt to merge each entries array, so we need to delete it
  let commonConfig = common.getWebpackConfig(skyPagesConfig, argv);
  commonConfig.entry = null;

  // Since the preloader is executed against the file system during an AoT build,
  // we need to remove it from the webpack config, otherwise it will get executed twice.
  commonConfig.module.rules = commonConfig.module.rules
    .filter((rule) => {
      const isPreloader = /(\/|\\)sky-processor(\/|\\)/.test(rule.loader);
      return (!isPreloader);
    });

  return webpackMerge(commonConfig, {
    mode: 'production',

    entry: {
      polyfills: [skyPagesConfigUtil.spaPathTempSrc('polyfills.ts')],
      app: [skyPagesConfigUtil.spaPathTempSrc('main-internal.aot.ts')]
    },

    // Disable sourcemaps for production:
    // https://webpack.js.org/configuration/devtool/#production
    devtool: false,

    module: {
      rules: [
        {
          test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
          loaders: ['@ngtools/webpack']
        },
        {
          test: /\.js$/,
          loader: '@angular-devkit/build-optimizer/webpack-loader',
          options: {
            sourceMap: false
          }
        }
      ]
    },
    plugins: [
      new AngularCompilerPlugin({
        tsConfigPath: skyPagesConfigUtil.spaPathTempSrc('tsconfig.json'),
        mainPath: skyPagesConfigUtil.spaPathTempSrc('main-internal.aot.ts'),
        // Type checking handled by Builder's ts-linter utility.
        typeChecking: false
      }),
      SaveMetadata
    ]
  });
}

module.exports = {
  getWebpackConfig: getWebpackConfig
};
