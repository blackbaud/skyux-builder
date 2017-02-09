/*jslint node: true */
'use strict';

const path = require('path');
const spawn = require('cross-spawn');
const logger = require('winston');
const portfinder = require('portfinder');
const HttpServer = require('http-server');
const selenium = require('selenium-standalone');
const build = require('./build');

const spawnOptions = { stdio: 'inherit' };

let SCRIPTS;
let SERVE_PORT;
let httpServer;
let seleniumServer;
let start;

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
function killServers(exitCode) {

  logger.info('Cleaning up running servers');
  if (seleniumServer) {
    logger.info('Closing selenium server');
    seleniumServer.kill();
  }

  if (httpServer) {
    logger.info('Closing http server');
    httpServer.close();
  }

  // Catch protractor's "Kitchen Sink" error.
  if (exitCode === 199) {
    logger.warn('Supressing protractor\'s "kitchen sink" error 199');
    exitCode = 0;
  }

  logger.info(`Execution Time: ${(new Date().getTime() - start)/1000} seconds`);
  logger.info(`Exiting process with ${exitCode}`);
  process.exit(exitCode || 0);
}

/**
 * Spawns the protractor command.
 * Perhaps this should be API driven?
 * @name spawnProtractor
 */
function spawnProtractor(skyPagesConfig) {

  logger.info('Running Protractor');
  const protractorPath = path.resolve(
    'node_modules',
    '.bin',
    'protractor'
  );

  const protractor = spawn.spawn(
    protractorPath,
    [
      getProtractorConfigPath(),
      `--baseUrl ${skyPagesConfig.host.url}`
      `--params.port=${SERVE_PORT}`,
      `--params.scripts=${JSON.stringify(SCRIPTS)}`,
      `--params.skyPagesConfig=${JSON.stringify(skyPagesConfig)}`
    ],
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
  return new Promise(resolve => {
    logger.info('Spawning Selenium');

    // Assumes we're running selenium oursevles, so we should prep it
    if (config.seleniumAddress) {
      selenium.install({ logger: logger.info }, () => {
        selenium.start((err, child) => {
          seleniumServer = child;
          logger.info('Selenium server is ready.');
          resolve();
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
      logger.info('Selenium server is ready.');
      resolve();
    }
  });
}

/**
 * Spawns the httpServer
 */
function spawnServer() {
  return new Promise(resolve => {
    logger.info('Requesting Open Port');
    httpServer = HttpServer.createServer({
      root: 'dist/',
      cors: true,
      https: {
        cert: path.resolve(__dirname, '../', 'ssl', 'server.crt'),
        key: path.resolve(__dirname, '../', 'ssl', 'server.key')
      }
    });
    portfinder.getPortPromise().then(port => {
      SERVE_PORT = port;
      logger.info(`Open Port Found: ${port}`);
      logger.info('Starting Web Server');
      httpServer.listen(port, 'localhost', () => {
        logger.info('Web Server Running');
        resolve();
      });
    });
  });
}

/**
 * Spawns the build process.  Captures the config used.
 */
function spawnBuild(argv, skyPagesConfig, webpack) {
  return new Promise(resolve => {
    logger.info('Starting Build');
    build(argv, skyPagesConfig, webpack).then(scripts => {
      logger.info('Completed Build');
      SCRIPTS = scripts;
      resolve();
    });
  });
}

/**
 * Spawns the necessary commands for e2e.
 * Assumes build was ran.
 * @name e2e
 */
function e2e(argv, skyPagesConfig, webpack) {
  start = new Date().getTime();
  process.on('SIGINT', killServers);

  const buildPromise = spawnBuild(argv, skyPagesConfig, webpack);
  const serverPromise = spawnServer();
  const seleniumPromise = spawnSelenium();

  Promise.all([
    buildPromise,
    serverPromise,
    seleniumPromise
  ]).then(() => {
    spawnProtractor(skyPagesConfig);
  });
}

module.exports = e2e;
