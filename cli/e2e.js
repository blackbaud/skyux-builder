/*jslint node: true */
'use strict';

const path = require('path');
const spawn = require('cross-spawn');
const logger = require('winston');
const selenium = require('selenium-standalone');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackMerge = require('webpack-merge');

const spawnOptions = { stdio: 'inherit' };
let webpackServer;
let seleniumServer;
let protractor;

/**
 * Function to get the protractorConfigPath
 * @name getProtractorConfigPath
 * @returns {string} protractorConfigPath
 */
function getProtractorConfigPath() {
  return path.resolve(
    __dirname,
    '..',
    'config',
    'protractor',
    'protractor.conf.js'
  );
}

/**
 * Handles killing off the selenium and webpack servers.
 * @name killServers
 */
function killServers() {

  logger.info('Cleaning up running servers');
  if (seleniumServer) {
    logger.info('Closing selenium server');
    seleniumServer.kill();
  }

  if (webpackServer) {
    logger.info('Closing webpack server');
    webpackServer.close();
  }

  if (protractor) {
    logger.info('Closing protractor');
    protractor.kill();
  }

  process.exit(0);
}

/**
 * Spawns the protractor command.
 * Perhaps this should be API driven?
 * @name spawnProtractor
 */
function spawnProtractor() {

  logger.info('Beginning e2e tests.');
  const protractorPath = path.resolve(
    'node_modules',
    '.bin',
    'protractor'
  );

  protractor = spawn.spawn(
    protractorPath,
    [getProtractorConfigPath()],
    spawnOptions
  );

  protractor.on('exit', killServers);
}

/**
 * Spawns the selenium server if directConnect is not enabled.
 * @name spawnSelenium
 */
function spawnSelenium() {

  const config = require(getProtractorConfigPath()).config;

  // Assumes we're running selenium oursevles, so we should prep it
  if (config.seleniumAddress) {
    selenium.install({ logger: logger.info }, () => {
      selenium.start((err, child) => {
        seleniumServer = child;
        logger.info('Selenium server is ready.');
        spawnProtractor();
      });
    });

  // Otherwise we need to prep protractor's selenium
  } else {
    const webdriverManagerPath = path.resolve(
      'node_modules',
      '.bin',
      'webdriver-manager'
    );
    spawn.sync(webdriverManagerPath, ['update'], spawnOptions);
    spawnProtractor();
  }

}

/**
 * Webpack plugin which binds to the done event.
 * @name WebpackPluginDoneE2E
 */
function WebpackPluginDoneE2E() {
  this.plugin('done', () => {
    logger.info('Webpack server is ready.');
    spawnSelenium();
  });
}

/**
 * Spawns the protractor command.
 * @name e2e
 */
function e2e(argv) {

  // Multiple runs could cause conflicts
  webpackServer = null;
  seleniumServer = null;

  // Politely kill any of our servers
  process.on('SIGINT', () => {
    killServers();
  });

  // Allows serve to be run independently
  if (argv.noServe) {
    spawnSelenium();
    return;
  }

  const webpackConfig = require('../config/webpack/serve.webpack.config');
  const skyPagesConfig = require('../config/sky-pages/sky-pages.config');
  const config = webpackMerge(
    webpackConfig.getWebpackConfig(
      {
        noOpen: true
      },
      skyPagesConfig.getSkyPagesConfig()
    ),
    {
      devServer: {
        colors: false
      },
      plugins: [WebpackPluginDoneE2E]
    }
  );

  const compiler = webpack(config);
  webpackServer = new WebpackDevServer(compiler, config.devServer);
  webpackServer.listen(config.devServer.port);
}

module.exports = e2e;
