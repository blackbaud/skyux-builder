/*jslint node: true */
'use strict';

const fs = require('fs');
const path = require('path');
const webpackMerge = require('webpack-merge');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

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

  const resolves = [
    process.cwd(),
    path.join(process.cwd(), 'node_modules'),
    path.join(__dirname, '..'),
    path.join(__dirname, '..', 'node_modules')
  ];

  return webpackMerge(common.getWebpackConfig(skyPagesConfigServe), {
    output: {
      filename: '[name].js',
      chunkFilename: '[id].[chunkhash].chunk.js'
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
    resolve: {
      root: resolves
    },
    resolveLoader: {
      root: resolves
    },
    module: {
      loaders: [
        {
          test: /\.json$/,
          loader: 'json'
        },
      ]
    },
    plugins: [
      new ProgressBarPlugin()
    ]
  });
};

module.exports = {
  getWebpackConfig: getWebpackConfig
};
