/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs-extra');
const merge = require('../../utils/merge');
const SpecReporter = require('jasmine-spec-reporter').SpecReporter;

const common = require('../../e2e/shared/common');
const commonConfig = require('./protractor.conf');

const config = {
  jasmineNodeOpts: {
    defaultTimeoutInterval: 480000 // git clone, npm install, and skyux build can be slow
  },
  onPrepare: () => {
    jasmine.getEnv().addReporter(new SpecReporter());

    return new Promise((resolve, reject) => {

      if (fs.existsSync(common.tmp) && !process.argv.includes('--clean')) {

        console.log('');
        console.log('*********');
        console.log('Running fast e2e tests');
        console.log(`Delete ${common.tmp} to have the install steps run.`);
        console.log('*********');
        console.log('');

        resolve();

      } else {

        const url = 'https://github.com/blackbaud/skyux-template';
        const branch = 'builder-dev';

        console.log('Running command using full install.');
        common.rimrafPromise(common.tmp)
          .then(() => common.exec(`git`, [
            `clone`,
            `-b`,
            branch,
            `--single-branch`,
            url,
            common.tmp
          ]))
          .then(() => common.exec(`npm`, [`i`, '--only=prod'], common.cwdOpts))
          .then(() => common.exec(`npm`, [`i`, `../`], common.cwdOpts))
          .then(resolve)
          .catch(reject);

      }
    });
  },

  // Catch any rogue servers
  onComplete: () => common.afterAll
};

exports.config = merge(commonConfig.config, config);
