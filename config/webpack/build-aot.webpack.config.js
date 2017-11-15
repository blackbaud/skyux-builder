/*jslint node: true */
'use strict';

const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const ngtools = require('@ngtools/webpack');
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
    entry: {
      polyfills: [skyPagesConfigUtil.spaPathTempSrc('polyfills.ts')],
      vendor: [skyPagesConfigUtil.spaPathTempSrc('vendor.ts')],
      skyux: [skyPagesConfigUtil.spaPathTempSrc('skyux.ts')],
      app: [skyPagesConfigUtil.spaPathTempSrc('main-internal.aot.ts')]
    },
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: '@ngtools/webpack'
        }
      ]
    },
    plugins: [
      new ngtools.AotPlugin({
        tsConfigPath: skyPagesConfigUtil.spaPathTempSrc('tsconfig.json'),
        entryModule: skyPagesConfigUtil.spaPathTempSrc('app', 'app.module') + '#AppModule',
        typeChecking: false
      }),
      SaveMetadata,
      new webpack.optimize.UglifyJsPlugin({
        beautify: false,
        comments: false,
        compress: { warnings: false },
        mangle: { screw_ie8: true, keep_fnames: true }
      })
    ]
  });
}

module.exports = {
  getWebpackConfig: getWebpackConfig
};
