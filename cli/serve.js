/*jshint node: true*/
'use strict';

const portfinder = require('portfinder');
const logger = require('@blackbaud/skyux-logger');
const assetsProcessor = require('../lib/assets-processor');
const localeAssetsProcessor = require('../lib/locale-assets-processor');

/**
 * Let users configure port via skyuxconfig.json first.
 * Else another plugin has specified devServer.port, use it.
 * Else, find us an available port.
 * @name getPort
 * @returns {Number} port
 */
function getPort(config, skyPagesConfig) {
  return new Promise((resolve, reject) => {
    const configPort = skyPagesConfig &&
      skyPagesConfig.skyux &&
      skyPagesConfig.skyux.app &&
      skyPagesConfig.skyux.app.port;

    if (configPort) {
      resolve(configPort);
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
    const localUrl = `https://localhost:${port}`;

    assetsProcessor.setSkyAssetsLoaderUrl(config, skyPagesConfig, localUrl);
    localeAssetsProcessor.prepareLocaleFiles();

    // Save our found or defined port
    config.devServer.port = port;

    /* istanbul ignore else */
    if (config.devServer.inline) {
      const inline = `webpack-dev-server/client?${localUrl}`;
      Object.keys(config.entry).forEach((entry) => {
        config.entry[entry].unshift(inline);
      });
    }

    if (config.devServer.hot) {
      const hot = `webpack/hot/only-dev-server`;
      Object.keys(config.entry).forEach((entry) => {
        config.entry[entry].unshift(hot);
      });

      // This is required in order to not have HMR requests routed to host.
      config.output.publicPath = `${localUrl}${config.devServer.publicPath}`;
      logger.info('Using hot module replacement.');
    }

    const compiler = webpack(config);
    const server = new WebpackDevServer(compiler, config.devServer);
    server.listen(config.devServer.port, 'localhost', (err) => {
      if (err) {
        logger.error(err);
      }
    });
  }).catch(err => logger.error(err));

}

module.exports = serve;
