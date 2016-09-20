/*jslint node: true */
'use strict';

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');

/**
 * Saves the stats.json file (needed for entry order)
 * @name SaveStats
 */
const SaveStats = function () {
  this.plugin('done', (stats) => {
    const json = JSON.stringify(stats.toJson());
    fs.writeFileSync(path.join(process.cwd(), 'dist', 'stats.json'), json);
  });
};

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
    plugins: [
      SaveStats,
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({
        beautify: false,
        comments: false,
        compress: { warnings: false },
        mangle: { screw_ie8: true, keep_fnames: true }
      })
    ]
  });
};

module.exports = {
  getWebpackConfig: getWebpackConfig
};
