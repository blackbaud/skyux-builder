/*jslint node: true */
'use strict';

const fs = require('fs');
const path = require('path');
const webpackMerge = require('webpack-merge');

/**
 * Opens the host service url.
 * @name WebpackPluginDone
 */
const WebpackPluginDone = function () {
  this.plugin('done', () => {
    console.log('DONE!');
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
    command: 'serve',
    host: {
      url: 'https://blackbaud-shell.azurewebsites.net/',
      qsKey: 'hash'
    }
  });

  return webpackMerge(common.getWebpackConfig(skyPagesConfigServe), {
    watch: true,
    output: {
      filename: '[name].js',
      chunkFilename: '[id].chunk.js'
    },
    devServer: {
      port: 31337,
      secure: false,
      colors: true,
      compress: true,
      inline: true,
      historyApiFallback: true,
      stats: 'minimal',
      https: {
        key: fs.readFileSync(path.join(__dirname, '../ssl/server.key')),
        cert: fs.readFileSync(path.join(__dirname, '../ssl/server.crt'))
      }
    },
    debug: true,
    devtool: 'cheap-module-eval-source-map',
    module: {
      loaders: [
        {
          test: /\.json$/,
          loader: 'json'
        },
      ]
    },
    plugins: [
      WebpackPluginDone
    ]
  });
};

module.exports = {
  getWebpackConfig: getWebpackConfig
};
