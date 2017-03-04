/*jshint jasmine: true, node: true */
'use strict';

const path = require('path');
const SpecReporter = require('jasmine-spec-reporter');

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
      'args': [
        '--disable-extensions',
        '--ignore-certificate-errors',
        '--incognito'
      ]
    }
  },
  directConnect: true,
  // seleniumAddress: 'http://localhost:4444/wd/hub',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  },
  useAllAngular2AppRoots: true,
  beforeLaunch: function () {
    require('ts-node').register();
  },

  onPrepare: function () {
    jasmine.getEnv().addReporter(new SpecReporter());
  }
};
