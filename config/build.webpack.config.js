/*jslint node: true */
'use strict';

const webpack = require('webpack');
const merge = require('webpack-merge');
const serve = require('./serve.config');

/**
 * Returns the default webpackConfig.
 * @name getDefaultWebpackConfig
 * @returns {WebpackConfig} webpackConfig
 */
const getDefaultWebpackConfig = () => ({
  output: {
    filename: '[name].[chunkhash].js',
    chunkFilename: '[id].[chunkhash].chunk.js'
  },
  devtool: 'source-map',
  watch: false,
  SKY_PAGES: {
    command: 'build'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      mangle: { screw_ie8: true, keep_fnames: true }
    })
  ]
});

/**
 * Called when loaded via require.
 * @name getWebpackConfig
 * @returns {WebpackConfig} webpackConfig
 */
const getWebpackConfig = (skyPagesConfig) =>
  merge(serve.getWebpackConfig(skyPagesConfig), getDefaultWebpackConfig());

// Expose
module.exports = {
  getWebpackConfig: getWebpackConfig
};
