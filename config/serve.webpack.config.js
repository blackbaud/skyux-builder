/*jslint node: true */
'use strict';

const fs = require('fs');
const path = require('path');
const webpackMerge = require('webpack-merge');
const failPlugin = require('webpack-fail-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const commonConfig = require('./common.webpack.config');

/**
 * Returns the default webpackConfig.
 * @name getDefaultWebpackConfig
 * @returns {WebpackConfig} webpackConfig
 */
const getWebpackConfig = () => {
  const resolves = [
    process.cwd(),
    path.join(process.cwd(), 'node_modules'),
    path.join(__dirname, '..'),
    path.join(__dirname, '..', 'node_modules')
  ];
  return webpackMerge(commonConfig, {
    entry: {
      polyfills: [path.resolve(__dirname, '..', 'src', 'polyfills.ts')],
      vendor: [path.resolve(__dirname, '..', 'src', 'vendor.ts')],
      app: [path.resolve(__dirname, '..', 'src', 'main.ts')]
    },
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
    SKY_PAGES: {
      command: 'serve',
      host: {
        url: 'https://blackbaud-shell.azurewebsites.net/',
        qsKey: 'hash'
      }
    },
    plugins: [
      new ProgressBarPlugin(),
      failPlugin
    ]
  });
};

module.exports = getWebpackConfig();
