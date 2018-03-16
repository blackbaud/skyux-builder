/*jshint jasmine: true, node: true */
'use strict';

const path = require('path');
const { config } = require('./protractor.conf');
const { SpecReporter } = require('jasmine-spec-reporter');

config.specs = [
  path.join(process.cwd(), '**', '*.visual-spec.ts')
];

config.onPrepare = function () {
  jasmine.getEnv().addReporter(new SpecReporter());

  browser.skyVisualTestConfig = {
    basePath: 'screenshots-baseline-local',
    diffPath: 'screenshots-diff-local',
    createdPath: 'screenshots-created-local',
    createdPathDiff: 'screenshots-created-diff-local',
    baseline: true,
    width: 1000,
    height: 800
  };
};

exports.config = config;
