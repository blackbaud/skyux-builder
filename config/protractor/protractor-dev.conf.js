/*jshint jasmine: true, node: true */
'use strict';

const path = require('path');
const merge = require('merge');
const SpecReporter = require('jasmine-spec-reporter');

const common = require('../../e2e/shared/common');
const commonConfig = require('./protractor.conf');

exports.config = merge(commonConfig.config, {
  specs: [
    path.join(process.cwd(), 'e2e', '**', '*.e2e-spec.js')
  ],
  jasmineNodeOpts: {
    defaultTimeoutInterval: 480000 // git clone, npm install, and skyux build can be slow
  },
  capabilities: {
    'browserName': 'firefox'
  },
  onPrepare: () => {

    const url = 'https://github.com/blackbaud/skyux-template';
    jasmine.getEnv().addReporter(new SpecReporter());

    return new Promise((resolve, reject) => {
      common.exec(`rm`, [`-rf`, `${common.tmp}`])
        .then(() => common.exec(`git`, [`clone`, `${url}`, `${common.tmp}`]), common.catchReject)
        .then(() => common.exec(`npm`, [`i`], common.cwdOpts), common.catchReject)
        .then(() => common.exec(`npm`, [`i`, `../`], common.cwdOpts), common.catchReject)
        .then(resolve, reject);
    });
  },

  onComplete: () => {

    // Catch any rogue servers
    common.afterAll();

    return new Promise((resolve, reject) => {
      common.exec(`rm`, [`-rf`, `${common.tmp}`]).then(resolve, reject);
    });
  }
});
