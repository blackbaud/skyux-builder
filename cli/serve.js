/*jshint node: true*/
'use strict';

// const open = require('open');
const util = require('util');
const logger = require('winston');

/**
 * Executes the serve command.
 * @name serve
 * @name {Object} argv
 * @name {SkyPagesConfig} skyPagesConfig
 * @name {Webpack} webpack
 * @name {WebpackDevServer} WebpackDevServer
 * @returns null
 */
function serve(argv, skyPagesConfig, webpack, WebpackDevServer) {

  const webpackConfig = require('../config/webpack/serve.webpack.config');
  let config = webpackConfig.getWebpackConfig(argv, skyPagesConfig);

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
  server.listen(config.devServer.port, (err) => {
    if (err) {
      logger.error(err);
    }
  });

}

module.exports = serve;
