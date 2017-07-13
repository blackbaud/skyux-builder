/*jslint node: true */
'use strict';

const path = require('path');
const logger = require('winston');
const portfinder = require('portfinder');
const HttpServer = require('http-server');

let httpServer;

/**
 * Starts the httpServer
 * @name start
 */
function start() {
  return new Promise((resolve, reject) => {
    logger.info('Requesting open port...');

    httpServer = HttpServer.createServer({
      // root: 'dist/',
      cors: true,
      cache: -1,
      https: {
        cert: path.resolve(__dirname, '../ssl/server.crt'),
        key: path.resolve(__dirname, '../ssl/server.key')
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
 * Kills the server if it exists
 * @name kill
 */
function stop() {
  if (httpServer) {
    logger.info('Stopping http server');
    httpServer.close();
    httpServer = null;
  }
}

module.exports = {
  start: start,
  stop: stop
};
