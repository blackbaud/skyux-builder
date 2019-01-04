/*jshint node: true*/
'use strict';

/**
 * Requires the shared karma config and sets any local properties.
 * @name getConfig
 * @param {Object} config
 */
function getConfig(config) {
  const logger = require('@blackbaud/skyux-logger');
  const minimist = require('minimist');
  const argv = minimist(process.argv.slice(2));
  require(`./${argv.watch ? 'watch' : 'test'}.karma.conf`)(config);
  let skyPagesConfig = require('../sky-pages/sky-pages.config').getSkyPagesConfig(argv._[0]);
  let testWebpackConfig = require('../webpack/test.webpack.config');
  const path = require('path');
  const pactServers = require('../../utils/pact-servers');

  skyPagesConfig.runtime.pactConfig = {};
  skyPagesConfig.runtime.pactConfig.providers = pactServers.getAllPactServers();
  skyPagesConfig.runtime.pactConfig.pactProxyServer = pactServers.getPactProxyServer();

  if (skyPagesConfig.skyux.pacts) {
    skyPagesConfig.skyux.pacts.forEach((pact) => {
      // set pact settings not specified in config file
      pact.log = pact.log || path.resolve(process.cwd(), 'logs', `pact-${pact.provider}.log`);
      pact.dir = pact.dir || path.resolve(process.cwd(), 'pacts');
      pact.host = pactServers.getPactServer(pact.provider).host;
      pact.port = pactServers.getPactServer(pact.provider).port;
      pact.pactFileWriteMode = pact.pactFileWriteMode || 'overwrite';
    });
  } else {
    logger.error('No pact entry in configuration!');
  }

  config.set({
    frameworks: config.frameworks.concat('pact'),
    files: config.files.concat(path.resolve(
      process.cwd(),
      'node_modules/@pact-foundation/pact-web',
      `pact-web.js`
    )),
    pact: skyPagesConfig.skyux.pacts,
    plugins: config.plugins.concat('@pact-foundation/karma-pact'),
    webpack: testWebpackConfig.getWebpackConfig(skyPagesConfig, argv)

  });

}

module.exports = getConfig;
