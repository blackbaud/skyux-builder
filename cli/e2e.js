/*jslint node: true */
'use strict';

const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');
const spawn = require('cross-spawn');
const selenium = require('selenium-standalone');
const protractorLauncher = require('protractor/built/launcher');

const build = require('./build');
const server = require('./utils/server');
const logger = require('../utils/logger');
const configResolver = require('./utils/config-resolver');

// Disable this to quiet the output
const spawnOptions = { stdio: 'inherit' };

let seleniumServer;
let start;

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

  // Catch protractor's "Kitchen Sink" error.
  if (exitCode === 199) {
    logger.warn('Supressing protractor\'s "kitchen sink" error 199');
    exitCode = 0;
  }

  server.stop();
  logger.info(`Execution Time: ${(new Date().getTime() - start) / 1000} seconds`);
  logger.info(`Exiting process with ${exitCode}`);
  process.exit(exitCode || 0);
}

/**
 * Spawns the protractor command.
 * Perhaps this should be API driven?
 * @name spawnProtractor
 */
function spawnProtractor(configPath, chunks, port, skyPagesConfig) {
  logger.info('Running Protractor');
  protractorLauncher.init(configPath, {
    params: {
      localUrl: `https://localhost:${port}`,
      chunks: chunks,
      skyPagesConfig: skyPagesConfig
    }
  });
  process.on('exit', killServers);
}

/**
 * Spawns the selenium server if directConnect is not enabled.
 * @name spawnSelenium
 */
function spawnSelenium(configPath) {
  const config = require(configPath).config;

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
        'node_modules',
        '.bin',
        'webdriver-manager'
      );

      const results = spawn.sync(
        webdriverManagerPath,
        [
          'update',
          '--standalone', 'false',
          '--gecko', 'false'
        ],
        spawnOptions
      );

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
 * Spawns the build process.  Captures the config used.
 */
function spawnBuild(argv, skyPagesConfig, webpack) {
  return new Promise((resolve, reject) => {

    if (argv.build === false) {
      logger.info('Skipping build step');

      const file = 'dist/metadata.json';
      if (!fs.existsSync(file)) {
        logger.info(`Unable to skip build step.  "${file}" not found.`);
      } else {
        return resolve({
          metadata: fs.readJsonSync(file)
        });
      }
    }

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
function e2e(command, argv, skyPagesConfig, webpack) {
  start = new Date().getTime();
  process.on('SIGINT', killServers);

  const specsPath = path.resolve(process.cwd(), 'e2e/**/*.e2e-spec.ts');
  const specsGlob = glob.sync(specsPath);
  const configPath = configResolver.resolve(command, argv);

  if (specsGlob.length === 0) {
    logger.info('No spec files located. Stopping command from running.');
    return killServers(0);
  }

  server.start()
    .then((port) => {
      argv.assets = 'https://localhost:' + port;

      // The assets URL is built by combining the assets URL above with
      // the app's root directory, but in e2e tests the assets files
      // are served directly from the root.  This will back up a directory
      // so that asset URLs are built relative to the root rather than
      // the app's root directory.
      argv.assetsrel = '../';

      return Promise
        .all([
          spawnBuild(argv, skyPagesConfig, webpack),
          port,
          spawnSelenium(configPath)
        ]);
    })
    .then(values => {
      spawnProtractor(
        configPath,
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
