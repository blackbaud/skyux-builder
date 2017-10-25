/*jshint node: true*/
'use strict';

/**
 * Requires the shared karma config and sets any local properties.
 * @name getConfig
 * @param {Object} config
 */
function getConfig(config) {
  require('./watch.karma.conf')(config);
  const minimist = require('minimist');
  const argv = minimist(process.argv.slice(2));
  let skyPagesConfig = require('../sky-pages/sky-pages.config').getSkyPagesConfig(argv._[0]);
  let testWebpackConfig = require('../webpack/test.webpack.config');
  const portfinder = require('portfinder');
  const fs = require('fs');
  const logger = require('../../utils/logger');
  const path = require('path');
  const pactServers = require('../../utils/pact-servers');
  skyPagesConfig.skyux.pactServers = pactServers.getAllPactServers();
  let proxies = {};

  if (skyPagesConfig.skyux.pact) {
    skyPagesConfig.skyux.pact.forEach((pact) => {
      pact.log = path.resolve(process.cwd(), 'logs', 'pact.log');
      pact.dir = path.resolve(process.cwd(), 'pacts');
      pact.host = pactServers.getPactHost(pact.provider);
      pact.port = pactServers.getPactPort(pact.provider);
      proxies[`/${pact.provider}`] = {
        'target': pactServers.getPactServer(pact.provider).fullUrl,
        'changeOrigin': true
      };
    });
  }
  else {
    logger.error('No pact entry in configuration!');
  }


  config.set({
    frameworks: config.frameworks.concat('pact'),
    files: config.files.concat('../../node_modules/pact-web/pact-web.js'),
    pact: skyPagesConfig.skyux.pact,
    plugins: config.plugins.concat('@pact-foundation/karma-pact'),
    proxies: proxies,
    proxyReq: (proxyReq, req, res, options) => {
      let origin = skyPagesConfig.skyux.host.url || 'https://host.nxt.blackbaud.com';
      if (proxyReq.getHeader('Request Method') != 'OPTIONS') {
        proxyReq.setHeader('Origin', origin);
      }
    },
    proxyRes: (proxyRes, req, res, options) => {
      if (proxyRes.headers['Access-Control-Allow-Origin']) {
        // probably a more elegant solution, this sets the cors header back to the original host url.
        let origin = pactServers.getPactServer(proxyRes.headers['Access-Control-Allow-Origin'].split('/')[3]).host;
        proxyRes.headers['Access-Control-Allow-Origin'] = origin;
      }
    },
    webpack: testWebpackConfig.getWebpackConfig(skyPagesConfig, argv)

  });

}

module.exports = getConfig;
