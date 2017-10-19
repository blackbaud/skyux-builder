/*jshint node: true*/
'use strict';

/**
 * Requires the shared karma config and sets any local properties.
 * @name getConfig
 * @param {Object} config
 */
function getConfig(config) {
  require('./shared.karma.conf')(config);
  const minimist = require('minimist');
  const argv = minimist(process.argv.slice(2));
  let skyPagesConfig = require('../sky-pages/sky-pages.config').getSkyPagesConfig(argv._[0]);

  const portfinder = require('portfinder');
  let pactPort = skyPagesConfig.skyux.pact.port || 1234;
  const logger = require('../../utils/logger');
  const path = require('path');

  if (skyPagesConfig.skyux.pact) {
    skyPagesConfig.skyux.pact.log = path.resolve(process.cwd(), 'logs', 'pact.log'),
      skyPagesConfig.skyux.pact.dir = path.resolve(process.cwd(), 'pacts')
  }
  else {
    logger.error('No pact entry in configuration!');
  }

  config.set({
    frameworks: config.frameworks.concat('pact'),
    files: config.files.concat('../../node_modules/pact-web/pact-web.js'),
    pact: skyPagesConfig.skyux.pact,
    plugins: config.plugins.concat('@pact-foundation/karma-pact'),
    /**
     * By using a proxy we can define pre-emptive operations on requests and responses before
     * they are forwards to the original host (localhost:9876).  This ensures that
     * Access-Control-Allow-Origin exists with the correct origin.
     */

    proxies: {
      '/pact': {
        'target': 'http://' + (skyPagesConfig.skyux.pact.host || 'localhost:') + pactPort,
        changeOrigin: true
      }
    },
    proxyReq: function (proxyReq, req, res, options) {
      proxyReq.setHeader('Access-Control-Allow-Origin', 'https://host.nxt.blackbaud.com');
      if (proxyReq.getHeader('Request Method') !== 'OPTIONS')
        proxyReq.setHeader('Origin', 'https://host.nxt.blackbaud.com');
    },
    proxyRes: function (proxyRes, req, res) {
      proxyRes.headers['Access-Control-Allow-Origin'] = 'https://host.nxt.blackbaud.com';
    },
  });

}

module.exports = getConfig;
