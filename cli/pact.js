/*jslint node: true */
'use strict';

/**
 * Spawns the skyux pact command.
 * @name pact
 */
function pact(command, argv) {
  const logger = require('../utils/logger');
  const Server = require('karma').Server;
  const tsLinter = require('./utils/ts-linter');
  const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');
  var skyPagesConfig = skyPagesConfigUtil.getSkyPagesConfig(command);
  const httpProxy = require('http-proxy');
  var http = require('http');
  const portfinder = require('portfinder');

  argv = argv || process.argv;
  argv.command = command;

  let lintResult;

  const onRunStart = () => {
    lintResult = tsLinter.lintSync();
  };

  const onRunComplete = () => {
    if (lintResult.exitCode > 0) {
      // Pull the logger out of the execution stream to let it print
      // after karma's coverage reporter.
      setTimeout(() => {
        logger.error('Process failed due to linting errors:');
        lintResult.errors.forEach(error => logger.error(error));
      }, 10);
    }
  };

  const onExit = (exitCode) => {
    if (exitCode === 0) {
      exitCode = lintResult.exitCode;
    }

    logger.info(`Karma has exited with ${exitCode}.`);
    process.exit(exitCode);
  };

  // var proxy = httpProxy.createProxyServer({ target: 'http://localhost:' + karmaConfig.port + '/pact' });

  // proxy.on('proxyReq', function (proxyReq, req, res, options) {
  //   proxyReq.setHeader('Access-Control-Allow-Origin', skyPagesConfig.skyux.host.url || 'https://host.nxt.blackbaud.com');
  // });
  // proxy.on('proxyRes', function (proxyRes, req, res) {
  //   proxyReq.setHeader('Access-Control-Allow-Origin', skyPagesConfig.skyux.host.url || 'http://localhost:' + karmaConfig.port);
  // });

  // var pactProxyServer = http.createServer((req, res) => {

  //   proxy.web(req, res, {
  //     target: 'http://localhost:' + req.qu
  //   });

  // });

  var pactPortPromises = [];

  for (var i = 0; i < skyPagesConfig.skyux.pact.length; i++) {

    pactPortPromises.push(portfinder.getPortPromise());

  }

  Promise.all(pactPortPromises)
    .then((ports) => {

      skyPagesConfig.skyux.pactPorts = skyPagesConfig.skyux.pactPorts || {};
      for (var i = 0; i < skyPagesConfig.skyux.pact.length; i++) {

        skyPagesConfig.skyux.pactPorts[skyPagesConfig.skyux.pact[i].provider] = ports[i];

      }

      const karmaConfigUtil = require('karma').config;
      const karmaConfigPath = skyPagesConfigUtil.outPath(`config/karma/${command}.karma.conf.js`);
      const karmaConfig = karmaConfigUtil.parseConfig(karmaConfigPath);

      const server = new Server(karmaConfig, onExit);
      server.on('run_start', onRunStart);
      server.on('run_complete', onRunComplete);
      server.start();
    })
    .catch((err) => {
      logger.error(err);
    })
}

module.exports = pact;
