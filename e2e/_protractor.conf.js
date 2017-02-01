/*jshint jasmine: true, node: true */
'use strict';

const path = require('path');
const merge = require('merge');
const common = require('../config/protractor/protractor.conf');

exports.config = merge(common.config, {
  specs: [
    path.join(
      process.cwd(),
      'e2e',
      '**',
      '*.e2e-spec.js'
    )
  ],
  capabilities: {
    'browserName': 'firefox'
  },
  jasmineNodeOpts: {
    defaultTimeoutInterval: 480000
  }
});
