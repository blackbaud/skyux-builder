/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs');
const path = require('path');
const merge = require('merge');
const SpecReporter = require('jasmine-spec-reporter');

const common = require('../../e2e/shared/common');
const commonConfig = require('./protractor.conf');

function localInstall() {
  common.beforeAll();
  return common.exec(`npm`, [`i`, `../`], common.cwdOpts);
}

let config = {
  specs: [
    path.join(process.cwd(), 'e2e', '**', 'skyux-serve.e2e-spec.js')
  ],
  jasmineNodeOpts: {
    // git clone, npm install, and skyux build can be slow
    // Unfortunately this means legitimate failures take a while to show.
    // TODO, research setting this for just the onPrepare phase.
    defaultTimeoutInterval: 480000
  },
  onPrepare: () => {

    const url = 'https://github.com/blackbaud/skyux-template';
    jasmine.getEnv().addReporter(new SpecReporter());

    return new Promise((resolve, reject) => {

      if (process.argv.indexOf('--noInstall') > -1) {

        console.log('');
        console.log('Skipping all installation/cloning before running tests.');
        console.log('');
        resolve();

      } else if (fs.existsSync(common.tmp)) {

        console.log('');
        console.log(`Hey! Just a heads up I ran the "quick" version of these tests.`);
        console.log(`Delete the ${common.tmp} folder to run a full clone/install.`);
        console.log(`You can also use --noInstall to bypass all installation.`);
        console.log('');

        localInstall()
          .then(resolve)
          .catch(reject);

      } else {

        common.exec(`git`, [`clone`, `${url}`, `${common.tmp}`])
          .then(() => common.exec(`npm`, [`i`], common.cwdOpts))
          .then(localInstall)
          .then(resolve)
          .catch(reject);
      }
    });
  },

  // Catch any rogue servers
  onComplete: common.afterAll
};

// In CI, use firefox
if (process.env.TRAVIS) {
  config.capabilities = { browserName: 'firefox' };
}

exports.config = merge(commonConfig.config, config);
