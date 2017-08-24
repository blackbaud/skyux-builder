/*jslint node: true */
'use strict';

const open = require('open');
const logger = require('winston');

const build = require('./build');
const server = require('./shared/server');

function spawnBrowser(port, skyPagesConfig) {
  open(`https://localhost:${port}${skyPagesConfig.runtime.app.base}`);
}

/**
 * Spawns the necessary commands for building and serving a SPA's dist folder.
 * @name host
 */
function host(argv, skyPagesConfig, webpack) {
  skyPagesConfig.runtime.app.base = '/dist/';
  Promise
    .all([
      server.start(),
      build(argv, skyPagesConfig, webpack)
    ])
    .then(values => {
      spawnBrowser(
        values[0],
        skyPagesConfig
      );
    })
    .catch(err => {
      logger.warn(`ERROR [skyux host]: ${err.message}`);
    });
}

module.exports = host;
