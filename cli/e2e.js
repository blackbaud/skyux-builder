/*jslint node: true */
'use strict';

const path = require('path');
const spawn = require('cross-spawn');
const logger = require('winston');
const portfinder = require('portfinder');
const HttpServer = require('http-server');
const selenium = require('selenium-standalone');
const build = require('./build');

// Disable this to quiet the output
const spawnOptions = { stdio: 'inherit' };

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
    seleniumServer = null;
  }

  if (httpServer) {
    logger.info('Closing http server');
    httpServer.close();
    httpServer = null;
  }

  // Catch protractor's "Kitchen Sink" error.
  if (exitCode === 199) {
    logger.warn('Supressing protractor\'s "kitchen sink" error 199');
    exitCode = 0;
  }

  logger.info(`Execution Time: ${(new Date().getTime() - start) / 1000} seconds`);
  logger.info(`Exiting process with ${exitCode}`);
  process.exit(exitCode || 0);
}

/**
 * Spawns the protractor command.
 * Perhaps this should be API driven?
 * @name spawnProtractor
 */
function spawnProtractor(chunks, port, skyPagesConfig) {
  logger.info('Running Protractor');

  const protractorPath = path.resolve(
    __dirname,
    '..',
    'node_modules',
    '.bin',
    'protractor'
  );

  // Generate a trimmed-down version of skyPagesConfig to pass to host-utils.js
  let trimmedConfig = {
    skyux: {
      host: {},
      app: {}
    }
  };
  trimmedConfig.skyux.name = skyPagesConfig.skyux.name;
  trimmedConfig.skyux.host.url = skyPagesConfig.skyux.host.url;
  trimmedConfig.skyux.app.externals = skyPagesConfig.skyux.app.externals;

  const protractor = spawn.spawn(
    protractorPath,
    [
      getProtractorConfigPath(),
      `--baseUrl ${skyPagesConfig.skyux.host.url}`,
      `--params.localUrl=https://localhost:${port}`,
      `--params.chunks=${JSON.stringify(chunks)}`,
      `--params.skyPagesConfig=${JSON.stringify(trimmedConfig)}`
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

  return new Promise((resolve, reject) => {
    logger.info('Spawning selenium...');

    // Assumes we're running selenium ourselves, so we should prep it
    if (config.seleniumAddress) {
      logger.info('Installing Selenium...');
      selenium.install({ logger: logger.info }, () => {
        logger.info('Selenium installed. Starting...');
        selenium.start((err, child) => {
          if (err) {
            reject(err);
            return;
          }

          seleniumServer = child;
          logger.info('Selenium server is ready.');
          resolve();
        });
      });

    // Otherwise we need to prep protractor's selenium
    } else {
      const webdriverManagerPath = path.resolve(
        __dirname,
        '..',
        'node_modules',
        '.bin',
        'webdriver-manager'
      );

      let results = spawn.sync(webdriverManagerPath, ['update'], spawnOptions);

      if (results.error) {
        reject(results.error);
        return;
      }

      logger.info('Selenium server is ready.');
      resolve();
    }
  });
}

/**
 * Spawns the httpServer
 */
function spawnServer() {
  return new Promise((resolve, reject) => {
    logger.info('Requesting open port...');

    httpServer = HttpServer.createServer({
      root: 'dist/',
      cors: true,
      https: {
        cert: path.resolve(__dirname, '../', 'ssl', 'server.crt'),
        key: path.resolve(__dirname, '../', 'ssl', 'server.key')
      },
      logFn: (req, res, err) => {
        if (err) {
          reject(err);
          return;
        }
      }
    });

    portfinder
      .getPortPromise()
      .then(port => {
        logger.info(`Open port found: ${port}`);
        logger.info('Starting web server...');
        httpServer.listen(port, 'localhost', () => {
          logger.info('Web server running.');
          resolve(port);
        });
      })
      .catch(reject);
  });
}

/**
 * Spawns the build process.  Captures the config used.
 */
function spawnBuild(argv, skyPagesConfig, webpack) {
  return new Promise((resolve, reject) => {
    logger.info('Running build...');
    build(argv, skyPagesConfig, webpack)
      .then(stats => {
        logger.info('Build complete.');
        resolve(stats.toJson().chunks);
      })
      .catch(reject);
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

  Promise
    .all([
      spawnBuild(argv, skyPagesConfig, webpack),
      spawnServer(),
      spawnSelenium()
    ])
    .then(values => {
      spawnProtractor(
        values[0],
        values[1],
        skyPagesConfig
      );
    })
    .catch(err => {
      logger.warn(`ERROR [skyux e2e]: ${err.message}`);
      killServers(1);
    });
}

module.exports = e2e;
