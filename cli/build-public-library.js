/*jshint node: true*/
'use strict';

const spawn = require('cross-spawn');
const fs = require('fs-extra');
const rimraf = require('rimraf');
const logger = require('@blackbaud/skyux-logger');

const stageTypeScriptFiles = require('./utils/stage-library-ts');
const preparePackage = require('./utils/prepare-library-package');
const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');
const runCompiler = require('./utils/run-compiler');
const tsLinter = require('./utils/ts-linter');

function runLinter() {
  const lintResult = tsLinter.lintSync();
  if (lintResult.exitCode > 0) {
    process.exit(lintResult.exitCode);
  }
}

function cleanTemp() {
  rimraf.sync(skyPagesConfigUtil.spaPathTemp());
}

function cleanDist() {
  rimraf.sync(skyPagesConfigUtil.spaPath('dist'));
}

function cleanAll() {
  cleanTemp();
  cleanDist();
}

function copyRuntime() {
  fs.copySync(
    skyPagesConfigUtil.outPath('runtime'),
    skyPagesConfigUtil.spaPathTemp('runtime')
  );
}

function cleanRuntime() {
  rimraf.sync(skyPagesConfigUtil.spaPath('dist', 'runtime'));
}

function writeTSConfig() {
  var config = {
    'compilerOptions': {
      'target': 'es5',
      'module': 'es2015',
      'moduleResolution': 'node',
      'emitDecoratorMetadata': true,
      'experimentalDecorators': true,
      'allowSyntheticDefaultImports': true,
      'sourceMap': true,
      'noImplicitAny': true,
      'declaration': true,
      'skipLibCheck': true,
      'lib': [
        'dom',
        'es6'
      ],
      'types': [
        'jasmine',
        'node'
      ],
      'outDir': skyPagesConfigUtil.spaPath('dist'),
      'rootDir': skyPagesConfigUtil.spaPathTemp(),
      'baseUrl': '.',
      'paths': {
        '@blackbaud/skyux-builder/*': [
          '*'
        ]
      }
    },
    'exclude': [
      skyPagesConfigUtil.spaPathTemp('runtime')
    ]
  };

  fs.writeJSONSync(skyPagesConfigUtil.spaPathTemp('tsconfig.json'), config);
}

function writePlaceholderModule() {
  const content = `import { NgModule } from '@angular/core';
import './index';
@NgModule({})
export class SkyLibPlaceholderModule {}
`;

  fs.writeFileSync(skyPagesConfigUtil.spaPathTemp('main.ts'), content, {
    encoding: 'utf8'
  });
}

/**
 * Creates a UMD JavaScript bundle.
 * @param {*} skyPagesConfig
 * @param {*} webpack
 */
function createBundle(skyPagesConfig, webpack) {
  const webpackConfig = require('../config/webpack/build-public-library.webpack.config');
  const config = webpackConfig.getWebpackConfig(skyPagesConfig);
  return runCompiler(webpack, config);
}

/**
 * Transpiles TypeScript files into JavaScript files
 * to be included with the NPM package.
 */
function transpile() {
  return new Promise((resolve, reject) => {
    const result = spawn.sync(
      'node',
      [
        skyPagesConfigUtil.spaPath('node_modules', '.bin', 'ngc'),
        '--project',
        skyPagesConfigUtil.spaPathTemp('tsconfig.json')
      ],
      { stdio: 'inherit' }
    );

    if (result.err) {
      reject(result.err);
      return;
    }

    resolve();
  });
}

module.exports = (skyPagesConfig, webpack) => {
  runLinter();
  cleanAll();
  stageTypeScriptFiles();
  writeTSConfig();
  writePlaceholderModule();
  copyRuntime();

  return createBundle(skyPagesConfig, webpack)
    .then(() => transpile())
    .then(() => {
      cleanRuntime();
      preparePackage();
      cleanTemp();
      process.exit(0);
    })
    .catch((err) => {
      cleanAll();
      logger.error(err);
      process.exit(1);
    });
};
