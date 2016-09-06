/*jshint node: true*/
'use strict';

// const open = require('open');
const util = require('util');
const logger = require('winston');

/**
 * Handles the webpack done plugin.
 * @name onWebpackDone
 */
const onWebpackDone = (stats) => {
  logger.info('SKY Pages serve running.');
  logger.verbose(stats.toJson());
};

/**
 * Handles the webpack-dev-server callback.
 * @name onWebpackDevServerReady
 */
const onWebpackDevServerReady = (err) => {
  if (err) {
    logger.error(err);
  }
};

/**
 * Executes the serve command.
 * @name serve
 * @name {Object} argv
 * @name {SkyPagesConfig} skyPagesConfig
 * @name {Webpack} webpack
 * @name {WebpackDevServer} WebpackDevServer
 * @returns null
 */
const serve = (argv, skyPagesConfig, webpack, WebpackDevServer) => {
  let config = require('../config/serve.webpack.config');
  config.SKY_PAGES = skyPagesConfig;

  if (config.devServer.inline) {
    const url = util.format(
      'webpack-dev-server/client?https://localhost:%s',
      config.devServer.port
    );
    Object.keys(config.entry).forEach((entry) => {
      config.entry[entry].unshift(url);
    });
  }

  const compiler = webpack(config);
  const server = new WebpackDevServer(compiler, config.devServer);

  compiler.plugin('done', onWebpackDone);
  server.listen(config.devServer.port, onWebpackDevServerReady);
};

module.exports = serve;
