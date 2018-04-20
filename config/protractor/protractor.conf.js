/*jshint jasmine: true, node: true */
'use strict';

const path = require('path');
const SpecReporter = require('jasmine-spec-reporter').SpecReporter;
const logger = require('@blackbaud/skyux-logger');

exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    path.join(
      process.cwd(),
      'e2e',
      '**',
      '*.e2e-spec.ts'
    )
  ],
  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {
      'args': ['--disable-extensions --ignore-certificate-errors']
    }
  },
  directConnect: true,
  // seleniumAddress: 'http://localhost:4444/wd/hub',
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
