/*jslint node: true */
'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('winston');
const portfinder = require('portfinder');
const express = require('express');
const https = require('https');
const cors = require('cors');
const app = express();

let server;

/**
 * Starts the httpServer
 * @name start
 */
function start(root) {
  return new Promise((resolve, reject) => {

    const options = {
      cert: fs.readFileSync(path.resolve(__dirname, '../../ssl/server.crt')),
      key: fs.readFileSync(path.resolve(__dirname, '../../ssl/server.key'))
    };

    logger.info('Creating web server');
    app.use(cors());
    app.use(root || '/dist', express.static('dist'));

    server = https.createServer(options, app);
    server.on('error', reject);

    logger.info('Requesting open port...');
    portfinder
      .getPortPromise()
      .then(port => {
        logger.info(`Open port found: ${port}`);
        logger.info('Starting web server...');
        server.listen(port, 'localhost', () => {
          logger.info('Web server running.');
          resolve(port);
        });
      })
      .catch(reject);
  });
}

/**
 * Kills the server if it exists
 * @name kill
 */
function stop() {
  if (server) {
    logger.info('Stopping http server');
    server.close();
    server = null;
  }
}

module.exports = {
  start: start,
  stop: stop
};
