/*jslint node: true */
'use strict';

const util = require('util');
const open = require('opn');
const logger = require('@blackbaud/skyux-logger');
const hostUtils = require('../../utils/host-utils');
const skyPagesConfigUtil = require('../../config/sky-pages/sky-pages.config');

/**
 * Returns the querystring base for parameters allowed to be passed through.
 * PLEASE NOTE: The method is nearly duplicated in `runtime/params.ts`.
 * @name getQueryStringFromArgv
 * @param {Object} argv
 * @param {SkyPagesConfig} skyPagesConfig
 * @returns {string}
 */
function getQueryStringFromArgv(argv, skyPagesConfig) {

  const configParams = skyPagesConfig.skyux.params;

  let params;

  if (Array.isArray(configParams)) {
    params = configParams;
  } else {
    // Get the params that have truthy values, since false/undefined indicates
    // the parameter should not be added.
    params = Object.keys(configParams)
      .filter(configParam => configParams[configParam]);
  }

  let found = [];
  params.forEach(param => {
    if (argv[param]) {
      found.push(`${param}=${encodeURIComponent(argv[param])}`);
    }
  });

  if (found.length) {
    return `?${found.join('&')}`;
  }

  return '';
}

function browser(argv, skyPagesConfig, stats, port) {

  const queryStringBase = getQueryStringFromArgv(argv, skyPagesConfig);
  let localUrl = util.format(
    'https://localhost:%s%s',
    port,
    skyPagesConfigUtil.getAppBase(skyPagesConfig)
  );

  let hostUrl = hostUtils.resolve(
    queryStringBase,
    localUrl,
    stats.toJson().chunks,
    skyPagesConfig
  );

  // Edge uses a different technique (protocol vs executable)
  if (argv.browser === 'edge') {
    const edge = 'microsoft-edge:';
    argv.browser = undefined;
    hostUrl = edge + hostUrl;
    localUrl = edge + localUrl;
  }

  // Browser defaults to launching host
  argv.launch = argv.launch || 'host';

  switch (argv.launch) {
    case 'local':

      // Only adding queryStringBase to the message + local url opened,
      // Meaning doesn't need those to communicate back to localhost
      localUrl += queryStringBase;

      logger.info(`Launching Local URL: ${localUrl}`);
      open(localUrl, {
        app: argv.browser
      });
      break;

    case 'host':
      logger.info(`Launching Host URL: ${hostUrl}`);
      open(hostUrl, {
        app: argv.browser
      });
      break;

    default:
      logger.info(`Host URL: ${hostUrl}`);
      logger.info(`Local URL: ${localUrl}`);
      break;
  }
}

module.exports = browser;
