/*jshint jasmine: true, node: true */
'use strict';

const path = require('path');
const config = require('./protractor.conf');
const { SpecReporter } = require('jasmine-spec-reporter');
const PixDiff = require('pix-diff');

function getVisualTestConfig(suffix) {
  const config = {
    basePath: 'screenshots-baseline',
    diffPath: 'screenshots-diff',
    createdPath: 'screenshots-created',
    createdPathDiff: 'screenshots-created-diff',
    baseline: true,
    width: 1000,
    height: 800
  };

  if (suffix) {
    config.basePath += `-${suffix}`;
    config.diffPath += `-${suffix}`;
    config.createdPath += `-${suffix}`;
    config.createdPathDiff += `-${suffix}`;
  }

  return config;
}

config.specs = [
  path.join(
    process.cwd(),
    '**',
    '*.visual-spec.ts'
  )
];

config.onPrepare = function () {
  jasmine.getEnv().addReporter(new SpecReporter());

  browser.params.chunks = JSON.parse(browser.params.chunks);
  browser.params.skyPagesConfig = JSON.parse(browser.params.skyPagesConfig);
  browser.skyVisualTestConfig = getVisualTestConfig('local');
  browser.pixDiff = new PixDiff(browser.skyVisualTestConfig);
};

exports.config = config;
