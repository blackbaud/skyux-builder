/*jslint node: true */
'use strict';

const webpackMerge = require('webpack-merge');
const SaveMetadata = require('../../plugin/save-metadata');

/**
 * Returns the default webpackConfig.
 * @name getDefaultWebpackConfig
 * @returns {WebpackConfig} webpackConfig
 */
function getWebpackConfig(skyPagesConfig, argv) {
  const common = require('./common.webpack.config');
  const commonConfig = common.getWebpackConfig(skyPagesConfig, argv);

  return webpackMerge(commonConfig, {
    mode: 'production',

    devtool: false,

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
      SaveMetadata
    ]
  });
}

module.exports = {
  getWebpackConfig: getWebpackConfig
};
