/*jslint node: true */
'use strict';

const path = require('path');
const spawn = require('cross-spawn');
const logger = require('winston');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackMerge = require('webpack-merge');

/**
 * Spawns the protractor command.
 * Perhaps this should be API driven?
 * @name spawnProtractor
 */
function spawnProtractor() {

  const webdriverManagerPath = path.resolve(
    'node_modules',
    '.bin',
    'webdriver-manager'
  );

  const protractorPath = path.resolve(
    'node_modules',
    '.bin',
    'protractor'
  );

  const protractorConfigPath = path.resolve(
    __dirname,
    '..',
    'config',
    'protractor',
    'protractor.conf.js'
  );

  const options = { stdio: 'inherit' };

  spawn.sync(webdriverManagerPath, ['update'], options);
  spawn(webdriverManagerPath, ['start'], options);
  spawn(protractorPath, [protractorConfigPath], options);
}

/**
 * Webpack plugin which binds to the done event.
 * @name WebpackDonePlugin
 */
function WebpackDonePlugin() {
  this.plugin('done', () => {
    logger.info('Webpack ready.  Beginning e2e tests now.');
    spawnProtractor();
  });
}

/**
 * Spawns the protractor config.
 * @name test
 */
function e2e(argv) {

  // Allows serve to be run independently
  if (argv.noServe) {
    spawnProtractor();
    return;
  }

  const webpackConfig = require('../config/webpack/serve.webpack.config');
  const skyPagesConfig = require('../config/sky-pages/sky-pages.config');
  const config = webpackMerge(
    webpackConfig.getWebpackConfig(skyPagesConfig.getSkyPagesConfig()),
    {
      argv: { noOpen: true },
      plugins: [WebpackDonePlugin]
    }
  );

  const compiler = webpack(config);
  const server = new WebpackDevServer(compiler, config.devServer);
  server.listen(config.devServer.port);
}

module.exports = e2e;
