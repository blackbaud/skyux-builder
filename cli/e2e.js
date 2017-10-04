/*jslint node: true */
'use strict';

const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');
const selenium = require('selenium-standalone');
const protractorLauncher = require('protractor/built/launcher');
const webdriverManager = require('webdriver-manager/built/lib/cmds/update');

const build = require('./build');
const server = require('./utils/server');
const logger = require('../utils/logger');

// Needed since we're manually executing webdriver-manager outside context of protractor
const seleniumDriverPath = path.resolve(__dirname + '/selenium-drivers');

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
function spawnProtractor(chunks, port, skyPagesConfig, webdriverConfig) {
  logger.info('Running Protractor');

  let config = {
    params: {
      localUrl: `https://localhost:${port}`,
      chunks: chunks,
      skyPagesConfig: skyPagesConfig
    }
  };

  if (webdriverConfig && webdriverConfig.chrome && webdriverConfig.chrome.last) {
    config.chromeDriver = webdriverConfig.chrome.last;
  }

  if (webdriverConfig && webdriverConfig.gecko && webdriverConfig.gecko.last) {
    config.geckoDriver = webdriverConfig.gecko.last;
  }

  protractorLauncher.init(getProtractorConfigPath(), config);
  process.on('exit', killServers);
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
      webdriverManager.program
        .run({
          out_dir: seleniumDriverPath
        })
        .then(() => {
          const updateConfigPath = path.resolve(seleniumDriverPath + '/update-config.json');
          const updateConfig = fs.readJsonSync(updateConfigPath);

          logger.info(`Webdriver Manager has been updated.`);
          logger.info(`Reading drivers from ${updateConfigPath}`);
          logger.info(updateConfig);

          resolve(updateConfig);
        })
        .catch(reject);
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
function e2e(argv, skyPagesConfig, webpack) {
  start = new Date().getTime();
  process.on('SIGINT', killServers);

  const specsPath = path.resolve(process.cwd(), 'e2e/**/*.e2e-spec.ts');
  const specsGlob = glob.sync(specsPath);

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
          spawnSelenium()
        ]);
    })
    .then(values => {
      spawnProtractor(
        values[0],
        values[1],
        skyPagesConfig,
        values[2]
      );
    })
    .catch(err => {
      logger.warn(`ERROR [skyux e2e]: ${err.message}`);
      killServers(1);
    });
}

module.exports = e2e;
