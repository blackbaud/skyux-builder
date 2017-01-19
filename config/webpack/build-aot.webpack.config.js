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
function getWebpackConfig(skyPagesConfig) {
  const common = require('./common.webpack.config');
  const skyPagesConfigServe = webpackMerge(skyPagesConfig, {
    command: 'build'
  });

  let commonConfig = common.getWebpackConfig(skyPagesConfigServe);

  commonConfig.entry = null;

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
        entryModule: skyPagesConfigUtil.spaPathTempSrc('app', 'app.module') + '#AppModule'
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
