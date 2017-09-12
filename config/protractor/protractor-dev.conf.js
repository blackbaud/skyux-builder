/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs-extra');
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
          .then(() => {
            const builderJson = fs.readJSONSync('package.json');
            const templateFilename = path.resolve('.e2e-tmp/package.json');
            const templateJson = fs.readJSONSync(templateFilename);

            for (let key in builderJson.dependencies) {
              if (builderJson.dependencies.hasOwnProperty(key)) {
                templateJson.dependencies[key] = builderJson.dependencies[key];
              }
            }

            console.log('Copying over npm-shrinkwrap.json');
            fs.copySync('npm-shrinkwrap.json', '.e2e-tmp/npm-shrinkwrap.json');

            console.log('Merging current builder deps into template');
            fs.writeJSONSync(templateFilename, builderJson, { spaces: 2 });
            return Promise.resolve();
          })
          .then(() => common.exec(`npm`, [`install`], common.cwdOpts))
          .then(() => {

            function filter(src) {
              return src.indexOf('node_modules') === -1 && src.indexOf('.e2e-tmp') === -1;
            }

            console.log('Copying current builder');
            fs.copySync('.', '.e2e-tmp/node_modules/@blackbaud/skyux-builder', { filter: filter });
            return Promise.resolve();
          })
          .then(resolve)
          .catch(reject);

      }
    });
  },

  // Catch any rogue servers
  onComplete: () => common.afterAll
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
