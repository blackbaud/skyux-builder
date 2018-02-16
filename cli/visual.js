/*jslint node: true */
'use strict';

const path = require('path');
const e2e = require('./e2e');

function runVisualTests(argv, skyPagesConfig, webpack) {
  argv.config = path.resolve(
    __dirname,
    '..',
    'config',
    'protractor',
    'visual.protractor.conf.js'
  );

  argv.specs = '**/*.visual-spec.ts';

  e2e(argv, skyPagesConfig, webpack);
}

module.exports = runVisualTests;
