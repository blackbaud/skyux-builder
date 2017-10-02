/*jshint jasmine: true, node: true */
/*global browser */
'use strict';

const merge = require('merge');
const path = require('path');
const commonConfig = require('./protractor.conf');
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

const visualConfig = {
  specs: [
    spaPath('src', 'app', '**', '*.visual-spec.ts')
  ],
  onPrepare
};

const config = merge(commonConfig, visualConfig);

module.exports = {
  config
};
