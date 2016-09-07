/*jslint node: true */
'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const logger = require('winston');
const webpackMerge = require('webpack-merge');

/**
 * Opens the host service url.
 * @name WebpackPluginDone
 */
const WebpackPluginDone = function () {
  let reported = false;
  const url = util.format(
    'https://localhost:%s%s',
    this.options.devServer.port,
    this.options.devServer.publicPath
  );
  this.plugin('done', () => {
    if (!reported) {
      reported = true;
      logger.info('AVAILABLE AT: %s\n', url);
    }
  });
};

/**
 * Returns the default webpackConfig.
 * @name getDefaultWebpackConfig
 * @returns {WebpackConfig} webpackConfig
 */
const getWebpackConfig = (skyPagesConfig) => {

  const skyPagesConfigServe = webpackMerge(skyPagesConfig, {
    command: 'serve',
    host: {
      url: 'https://blackbaud-shell.azurewebsites.net/',
      qsKey: 'hash'
    }
  });
  const common = require('./common.webpack.config')
    .getWebpackConfig(skyPagesConfigServe);

  return webpackMerge(common, {
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
      historyApiFallback: {
        index: common.output.publicPath
      },
      stats: 'minimal',
      https: {
        key: fs.readFileSync(path.join(__dirname, '../ssl/server.key')),
        cert: fs.readFileSync(path.join(__dirname, '../ssl/server.crt'))
      },
      publicPath: common.output.publicPath
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
