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
  logger.info(stats.toJson());
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
 */
const serve = (argv, webpack, WebpackDevServer) => {
  let config = require('../config/serve.webpack.config');

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
