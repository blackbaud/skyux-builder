/*jslint node: true */
'use strict';

const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const SaveMetadata = require('../../plugin/save-metadata');

/**
 * Returns the default webpackConfig.
 * @name getDefaultWebpackConfig
 * @returns {WebpackConfig} webpackConfig
 */
function getWebpackConfig(skyPagesConfig, argv) {
  const common = require('./common.webpack.config');

  return webpackMerge(common.getWebpackConfig(skyPagesConfig, argv), {
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            {
              loader: 'awesome-typescript-loader',
              options: {
                // Ignore the "Cannot find module" error that occurs when referencing
                // an aliased file.  Webpack will still throw an error when a module
                // cannot be resolved via a file path or alias.
                ignoreDiagnostics: [2307],
                transpileOnly: true
              }
            },
            {
              loader: 'angular2-template-loader'
            }
          ]
        }
      ]
    },
    plugins: [
      SaveMetadata,
      new webpack.optimize.UglifyJsPlugin({
        beautify: false,
        comments: false,
        mangle: { screw_ie8: true, keep_fnames: true },
        sourceMap: true
      })
    ]
  });
}

module.exports = {
  getWebpackConfig: getWebpackConfig
};
