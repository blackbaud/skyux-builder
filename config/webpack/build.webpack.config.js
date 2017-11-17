/*jslint node: true */
'use strict';

const webpackMerge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
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

      new UglifyJSPlugin({
        parallel: true,
        exclude: /node_modules/,
        uglifyOptions: {
          compress: {
            warnings: false
          },
          mangle: {
            keep_fnames: true
          }
        }
      })
    ]
  });
}

module.exports = {
  getWebpackConfig: getWebpackConfig
};
