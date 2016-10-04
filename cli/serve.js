/*jshint node: true*/
'use strict';

// const open = require('open');
const util = require('util');
const logger = require('winston');

/**
 * Handles the webpack-dev-server callback.
 * @name onWebpackDevServerReady
 */
const onWebpackDevServerReady = (err) => {
  /* istanbul ignore else */
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

  const webpackConfig = require('../config/webpack/serve.webpack.config');
  let config = webpackConfig.getWebpackConfig(skyPagesConfig);
  config.argv = argv;

  /* istanbul ignore else */
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
  server.listen(config.devServer.port, onWebpackDevServerReady);

};

module.exports = serve;
