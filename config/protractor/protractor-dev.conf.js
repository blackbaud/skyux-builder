/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs-extra');
const path = require('path');
const merge = require('merge');
const SpecReporter = require('jasmine-spec-reporter').SpecReporter;

const common = require('../../e2e/shared/common');
const commonConfig = require('./protractor.conf');

/**
 * Clones the skyux-template from a specific branch.
 */
function cloneTemplate() {
  const url = 'https://github.com/blackbaud/skyux-template';
  const branch = 'builder-dev';

  return common.exec(`git`, [
    `clone`,
    `-b`,
    branch,
    `--single-branch`,
    url,
    common.tmp
  ]);
}

/**
 * Copies current builder dependencies to cloned template.
 */
function mergeDependencies() {
  const builderJson = fs.readJSONSync('package.json');
  const templateFilename = path.resolve(common.tmp, 'package.json');
  const templateJson = fs.readJSONSync(templateFilename);

  Object.keys(builderJson.dependencies).forEach(key => {
    templateJson.dependencies[key] = builderJson.dependencies[key];
  });

  console.log('Merging current builder deps into template');
  fs.writeJSONSync(templateFilename, templateJson, { spaces: 2 });
  return Promise.resolve();
}

/**
 * Copies the npm-shrinkwrap or package-lock files if they exist.
 */
function copyLocks() {
  const locks = [
    'npm-shrinkwrap.json',
    'package-lock.json'
  ];

  locks.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`Copying ${file} into cloned template.`);
      fs.copySync(file, `${common.tmp}${file}`);
    } else {
      console.log(`Skipping ${file} as it does not exist.`);
    }
  });

  return Promise.resolve();
}

/**
 * Copies current builder src into cloned template
 */
function copyBuilder() {
  function filter(src) {
    return src.indexOf('node_modules') === -1 && src.indexOf(common.tmp) === -1;
  }

  console.log('Copying current builder');
  fs.copySync('.', `${common.tmp}node_modules/@blackbaud/skyux-builder`, {
    filter: filter
  });

  return Promise.resolve();
}

/**
 * Create the local dev version of our config
 */
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

        console.log(``);
        console.log(`*********`);
        console.log(`Running fast e2e tests`);
        console.log(`Use one of the following to do a full install:`);
        console.log(` - Use npm run e2e -- --clean`);
        console.log(` - Delete ${common.tmp}`);
        console.log(`*********`);
        console.log(``);

        resolve();

      } else {

        // The --only=prod below is important in order to skip installing builder
        console.log('Running command using full install.');
        common.rimrafPromise(common.tmp)
          .then(cloneTemplate)
          .then(mergeDependencies)
          .then(copyLocks)
          .then(() => common.exec(`npm`, [`install`, '--only=prod'], common.cwdOpts))
          .then(copyBuilder)
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
