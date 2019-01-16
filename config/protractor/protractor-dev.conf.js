/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs-extra');
const path = require('path');
const merge = require('../../utils/merge');
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
        const branch = 'builder-dev-rc-rename-package';

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

            // This method attempts to take what would be installed from builder in to the SPA.
            // It was the only reliable way I could convince NPM to install everything needed.
            const spaPkgPath = path.resolve(common.tmp, 'package.json');
            const spaPkgJson = fs.readJsonSync(spaPkgPath);

            const builderPkgPath = path.resolve('package.json');
            const builderPkgJson = fs.readJsonSync(builderPkgPath);

            Object.keys(builderPkgJson.dependencies).forEach(dep => {
              spaPkgJson.dependencies[dep] = builderPkgJson.dependencies[dep];
            });

            // Remove any installed versions of Builder.
            delete spaPkgJson.devDependencies['@skyux-sdk/builder'];

            fs.writeJsonSync(spaPkgPath, spaPkgJson, { spaces: 2 });
          })
          .then(() => common.exec(`npm`, [`i`], common.cwdOpts))
          .then(() => {
            // Copy builder's local source to node_modules.
            const files = [
              'cli',
              'config',
              'e2e',
              'lib',
              'loader',
              'plugin',
              'runtime',
              'src',
              'ssl',
              'utils',
              'index.js',
              'package.json',
              'skyuxconfig.json',
              'tsconfig.json',
              'tslint.json'
            ];

            files.forEach(file => {
              fs.copySync(
                file,
                path.resolve(
                  common.tmp,
                  `node_modules/@skyux-sdk/builder/${file}`
                )
              );
            });
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
