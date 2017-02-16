/*jshint node: true*/
'use strict';

const logger = require('winston');
const portfinder = require('portfinder');

/**
 * Let users configure port via skyuxconfig.json first.
 * Else another plugin has specified devServer.port, use it.
 * Else, find us an available port.
 * @name getPort
 * @returns {Number} port
 */
function getPort(config, skyPagesConfig) {
  return new Promise((resolve, reject) => {
    if (skyPagesConfig.app && skyPagesConfig.app.port) {
      resolve(skyPagesConfig.app.port);
    } else if (config.devServer && config.devServer.port) {
      resolve(config.devServer.port);
    } else {
      portfinder.getPortPromise()
        .then(port => resolve(port))
        .catch(err => reject(err));
    }
  });
}

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

  getPort(config, skyPagesConfig).then(port => {

    // Save our found or defined port
    config.devServer.port = port;

    /* istanbul ignore else */
    if (config.devServer.inline) {
      const hot = `webpack-dev-server/client?https://localhost:${port}`;
      Object.keys(config.entry).forEach((entry) => {
        config.entry[entry].unshift(hot);
      });
    }

    const compiler = webpack(config);
    const server = new WebpackDevServer(compiler, config.devServer);
    server.listen(config.devServer.port, (err) => {
      if (err) {
        logger.error(err);
      }
    });
  }).catch(err => logger.error(err));

}

module.exports = serve;
