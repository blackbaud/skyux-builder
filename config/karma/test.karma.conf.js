/*jshint node: true*/
'use strict';

/**
 * Requires the shared karma config and sets any local properties.
 * @name getConfig
 * @param {Object} config
 */
function getConfig(config) {
  require('./shared.karma.conf')(config);

  // This file is spawned so we'll need to read the args again
  const minimist = require('minimist');
  const argv = minimist(process.argv.slice(2));

  let configuration = {
    browsers: [
      'Chrome'
    ],
    customLaunchers: {
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    }
  };

  if (process.env.TRAVIS) {
    configuration.browsers = ['Chrome_travis_ci'];
  }

  if (argv.browserstack) {

    if (argv.username && argv.accessKey) {

      const customLaunchers = {
        bs_windows_chrome_latest: {
          base: 'BrowserStack',
          browser: 'chrome',
          os: 'Windows',
          os_version: '10'
        }
      };

      configuration = {
        browsers: Object.keys(customLaunchers),
        customLaunchers: customLaunchers,
        browserDisconnectTimeout: 3e5,
        browserDisconnectTolerance: 3,
        browserNoActivityTimeout: 3e5,
        captureTimeout: 3e5,
        browserStack: {
          username: argv.username,
          accessKey: argv.accessKey,
          port: 9876,
          pollingTimeout: 10000
        }
      };

      config.set(configuration);
      console.log('Configuring Karma to use Browserstack.');

    } else {
      console.error('Browserstack requires username and accessKey.')
    }
  }
}

module.exports = getConfig;
