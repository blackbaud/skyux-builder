/*jshint jasmine: true, node: true */
'use strict';

const path = require('path');
const { SpecReporter } = require('jasmine-spec-reporter');
const logger = require('@blackbaud/skyux-logger');

const config = {
  allScriptsTimeout: 11000,
  specs: [
    path.join(process.cwd(), 'e2e', '**', '*.e2e-spec.ts')
  ],
  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {
      'args': [
        '--disable-extensions',
        '--ignore-certificate-errors'
      ]
    }
  },
  directConnect: true,
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: logger.logColor,
    defaultTimeoutInterval: 30000
  },
  useAllAngular2AppRoots: true,
  beforeLaunch: function () {
    require('ts-node').register({ ignore: false });
  },

  onPrepare: function () {
    jasmine.getEnv().addReporter(new SpecReporter());
  }
};

module.exports = {
  config
};
