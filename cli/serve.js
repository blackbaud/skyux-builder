/*jshint node: true*/
'use strict';

const portfinder = require('portfinder');
const logger = require('@blackbaud/skyux-logger');
const { setSkyAssetsLoaderUrl } = require('../lib/assets-processor');
const { getWebpackConfig } = require('../config/webpack/serve.webpack.config');
const { prepareLocaleFiles } = require('../lib/locale-assets-processor');

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
  const webpackConfig = getWebpackConfig(argv, skyPagesConfig);

  getPort(webpackConfig, skyPagesConfig)
    .then(port => {
      const localUrl = `https://localhost:${port}`;

      setSkyAssetsLoaderUrl(webpackConfig, skyPagesConfig, localUrl);
      prepareLocaleFiles();

      // Save our found or defined port
      webpackConfig.devServer.port = port;

      /* istanbul ignore else */
      if (webpackConfig.devServer.inline) {
        const inline = `webpack-dev-server/client?${localUrl}`;
        Object.keys(webpackConfig.entry).forEach((entry) => {
          webpackConfig.entry[entry].unshift(inline);
        });
      }

      if (webpackConfig.devServer.hot) {
        const hot = `webpack/hot/only-dev-server`;
        Object.keys(webpackConfig.entry).forEach((entry) => {
          webpackConfig.entry[entry].unshift(hot);
        });

        // This is required in order to not have HMR requests routed to host.
        webpackConfig.output.publicPath = `${localUrl}${webpackConfig.devServer.publicPath}`;
        logger.info('Using hot module replacement.');
      }

      const compiler = webpack(webpackConfig);
      const server = new WebpackDevServer(compiler, webpackConfig.devServer);
      server.listen(webpackConfig.devServer.port, 'localhost', (err) => {
        if (err) {
          logger.error(err);
        }
      });
    })
    .catch(err => logger.error(err));
}

module.exports = serve;
