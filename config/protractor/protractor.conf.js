/*jshint jasmine: true, node: true */
'use strict';

const path = require('path');
const tsnode = require('ts-node');
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
      'args': ['--disable-extensions']
    }
  },
  directConnect: true,
  baseUrl: 'http://sky.blackbaud-dev.com',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  },
  useAllAngular2AppRoots: true,
  beforeLaunch: function () {
    tsnode.register();
  },

  onPrepare: function () {
    jasmine.getEnv().addReporter(new SpecReporter());
  }
};
