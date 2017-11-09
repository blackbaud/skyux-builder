/* jshint jasmine: true, node: true */
/* global browser */
'use strict';

const { spaPath } = require('../sky-pages/sky-pages.config');

function onPrepare() {
  const builderUtils = require('../../utils/host-utils');
  const SpecReporter = require('jasmine-spec-reporter').SpecReporter;
  const PixDiff = require('pix-diff');

  jasmine.getEnv().addReporter(new SpecReporter());

  browser.skyVisualTestConfig = {
    baseline: {
      basePath: spaPath('screenshots-baseline-local'),
      diffPath: spaPath('screenshots-diff-local'),
      baseline: true,
      width: 1000,
      height: 800
    }
  };

  browser.pixDiff = new PixDiff(browser.skyVisualTestConfig.baseline);

  const destination = builderUtils.resolve(
    '/',
    browser.params.localUrl,
    browser.params.chunks,
    browser.params.skyPagesConfig
  );

  return browser.get(destination);
}

const config = {
  useAllAngular2AppRoots: true,
  onPrepare,
  beforeLaunch: function () {
    require('ts-node').register({ ignore: false });
  },

  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 90000
  },
  allScriptsTimeout: 30000,
  specs: [
    spaPath('src', 'app', '**', '*.visual-spec.ts')
  ],
  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {
      'args': ['--ignore-certificate-errors']
    }
  },
  directConnect: true
};

exports.config = config;
