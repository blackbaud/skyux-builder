/*jslint node: true */
'use strict';

const webpack = require('webpack');
const webpackMerge = require('webpack-merge');

/**
 * Returns the default webpackConfig.
 * @name getDefaultWebpackConfig
 * @returns {WebpackConfig} webpackConfig
 */
const getWebpackConfig = (skyPagesConfig) => {
  const common = require('./common.webpack.config');
  const skyPagesConfigServe = webpackMerge(skyPagesConfig, {
    command: 'build'
  });

  return webpackMerge(common.getWebpackConfig(skyPagesConfigServe), {
    devtool: 'source-map',
    output: {
      filename: '[name].[chunkhash].js',
      chunkFilename: '[id].[chunkhash].chunk.js'
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: { warnings: false },
        mangle: { screw_ie8: true, keep_fnames: true }
      })
    ]
  });
};

module.exports = {
  getWebpackConfig: getWebpackConfig
};
