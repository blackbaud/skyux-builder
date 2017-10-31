/*jshint node: true*/
'use strict';

/**
 * Requires the shared karma config and sets any local properties.
 * @name getConfig
 * @param {Object} config
 */
function getConfig(config) {
  const minimist = require('minimist');
  const argv = minimist(process.argv.slice(2));
  require(`./${argv.watch ? 'watch' : 'test'}.karma.conf`)(config);

  let skyPagesConfig = require('../sky-pages/sky-pages.config').getSkyPagesConfig(argv._[0]);
  let testWebpackConfig = require('../webpack/test.webpack.config');
  const logger = require('../../utils/logger');
  const path = require('path');
  const pactServers = require('../../utils/pact-servers');

  skyPagesConfig.skyux.pactConfig.providers = pactServers.getAllPactServers();
  skyPagesConfig.skyux.pactConfig.pactProxyServer = pactServers.getPactProxyServer();

  if (skyPagesConfig.skyux.pactConfig.pacts) {
    var i = 0;
    skyPagesConfig.skyux.pactConfig.pacts.forEach((pact) => {
      // set pact settings not specified in config file
      pact.log = pact.log || path.resolve(process.cwd(), 'logs', `pact-${pact.provider}.log`);
      pact.dir = pact.dir || path.resolve(process.cwd(), 'pacts');
      pact.host = pactServers.getPactServer(pact.provider).host;
      pact.port = pactServers.getPactServer(pact.provider).port;
      i++;
    });
  } else {
    logger.error('No pact entry in configuration!');
  }

  config.set({
    frameworks: config.frameworks.concat('pact'),
    files: config.files.concat('../../node_modules/pact-web/pact-web.js'),
    pact: skyPagesConfig.skyux.pactConfig.pacts,
    plugins: config.plugins.concat('@pact-foundation/karma-pact'),
    webpack: testWebpackConfig.getWebpackConfig(skyPagesConfig, argv)

  });

}

module.exports = getConfig;
