/*jshint jasmine: true, node: true */
'use strict';

const path = require('path');
const merge = require('merge');
const SpecReporter = require('jasmine-spec-reporter').SpecReporter;

const common = require('../../e2e/shared/common');
const commonConfig = require('./protractor.conf');
let config = {
  specs: [
    path.join(process.cwd(), 'e2e', '**', '*.e2e-spec.js')
  ],
  jasmineNodeOpts: {
    defaultTimeoutInterval: 480000 // git clone, npm install, and skyux build can be slow
  },
  onPrepare: () => {
    jasmine.getEnv().addReporter(new SpecReporter());

    return new Promise((resolve, reject) => {
      const url = 'https://github.com/blackbaud/skyux-template';
      common.exec(`rm`, [`-rf`, `${common.tmp}`])

        .then(() => common.exec(`git`, [
          `clone`,
          `-b`,
          `update-package-dependencies`,
          `--single-branch`,
          `${url}`,
          `${common.tmp}`
        ]))

        .then(() => common.exec(`npm`, [`i`, '--only=prod'], common.cwdOpts))
        .then(() => common.exec(`npm`, [`i`, `../`], common.cwdOpts))
        .then(resolve)
        .catch(reject);
    });
  },

  onComplete: () => {

    // Catch any rogue servers
    common.afterAll();

    return new Promise((resolve, reject) => {
      common.exec(`rm`, [`-rf`, `${common.tmp}`])
        .then(resolve)
        .catch(reject);
    });
  }
};

exports.config = merge(commonConfig.config, config);
