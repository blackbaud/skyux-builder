/*jslint node: true */
'use strict';

/**
 * Spawns the skyux pact command.
 * @name pact
 */
function pact(command, argv) {
  const Server = require('karma').Server;
  const portfinder = require('portfinder');
  const url = require('url');
  const logger = require('../utils/logger');
  const tsLinter = require('./utils/ts-linter');
  const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');
  const pactServers = require('../utils/pact-servers');
  let skyPagesConfig = skyPagesConfigUtil.getSkyPagesConfig(command);
  let http = require('http');
  let httpProxy = require('http-proxy');

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

  let pactPortPromises = [];
  // get a free port for every config entry, plus one for the proxy
  if(! skyPagesConfig.skyux.pacts) {
    logger.error('skyux pact failed! pacts does not exist on configuration file.');
    process.exit();
  }
  for (let i = 0; i < skyPagesConfig.skyux.pacts.length + 1; i++) {

    pactPortPromises.push(portfinder.getPortPromise());

  }

  Promise.all(pactPortPromises)
    .then((ports) => {

      for (let i = 0; i < skyPagesConfig.skyux.pacts.length; i++) {

        let serverHost = (skyPagesConfig.skyux.pacts[i].host || 'localhost');
        let serverPort = (skyPagesConfig.skyux.pacts[i].port || ports[i]);
        // saving pact server information so it can carry over into karma config
        pactServers
        .savePactServer(skyPagesConfig.skyux.pacts[i].provider, serverHost, serverPort);
      }

      let proxy = httpProxy.createProxyServer({});

      // proxy requests to pact server to contain actual host url rather than the karma url
      proxy.on('proxyReq', function (proxyReq) {
        let origin = skyPagesConfig.skyux.host.url || 'https://host.nxt.blackbaud.com';
        proxyReq.setHeader('Origin', origin);
      });
      // revert CORS header value back to karma url so that requests are successful
      proxy.on('proxyRes', function (proxyRes, req) {
        proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin;
      });

      http.createServer((req, res) => {

        // provider is part of path so that consuming app can make requests to multiple pact
        // servers from one proxy server.  Use that value to identify proper pact server and then
        // remove from request url.
        let provider = url.parse(req.url).pathname.split('/')[1];
        req.url = req.url.split(provider)[1];

        if (Object.keys(pactServers.getAllPactServers()).indexOf(provider) !== -1) {
          proxy.web(req, res, {
            target: pactServers.getPactServer(provider).fullUrl
          });
        } else {
          logger
            .error(`Pact proxy path is invalid.  Expected format is base/provider-name/api-path.`);
        }
      }).listen(ports[ports.length - 1]);

      // for use by consuming app
      pactServers.savePactProxyServer(`http://localhost:${ports[ports.length - 1]}`);

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
    });
}

module.exports = pact;
