/*jshint jasmine: true, node: true */
'use strict';

const path = require('path');
const merge = require('merge');
const fs = require('fs-extra');
const spawn = require('cross-spawn');
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

    const url = 'https://github.com/blackbaud/skyux-template';
    const branch = 'builder-dev';

    return common.rimrafPromise(common.tmp)
      .then(() => common.exec('git', ['clone', url, '-b', branch, common.tmp]))

      // Get the current git branch.
      .then(() => {
        const result = spawn.sync('git', ['branch']);
        const output = result.stdout.toString();

        const branch = output
          .split('\n')
          .filter(name => (name.trim().indexOf('*') === 0))[0]
          .trim()
          .replace('* ', '');

        return branch;
      })

      // Link builder version to current git branch.
      .then((branch) => {
        const json = fs.readJSONSync(`${common.tmp}package.json`);
        json.devDependencies['@blackbaud/skyux-builder'] = `blackbaud/skyux-builder#${branch}`;
        fs.writeJSONSync(`${common.tmp}package.json`, json);
        return Promise.resolve();
      })

      // Install!
      .then(() => common.exec('npm', ['install'], common.cwdOpts));
  },

  onComplete: () => {
    // Catch any rogue servers
    common.afterAll();

    return common.rimrafPromise(common.tmp);
  }
};

// In CI, use firefox
if (process.env.TRAVIS) {
  config.capabilities = {
    browserName: 'chrome',
    'chromeOptions': {
      'args': ['--disable-extensions --ignore-certificate-errors']
    }
  };
}

exports.config = merge(commonConfig.config, config);
