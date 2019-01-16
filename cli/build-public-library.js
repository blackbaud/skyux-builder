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

function getEntryPointFiles() {
  const files = [
    skyPagesConfigUtil.spaPathTemp('index.ts')
  ];

  const testingPath = skyPagesConfigUtil.spaPathTemp('testing', 'index.ts');
  if (fs.existsSync(testingPath)) {
    files.push(testingPath);
  }

  return files;
}

function writeTSConfig() {
  const config = {
    'compilerOptions': {
      'target': 'es5',
      'module': 'es2015',
      'moduleResolution': 'node',
      'emitDecoratorMetadata': true,
      'experimentalDecorators': true,
      'allowSyntheticDefaultImports': true,
      'sourceMap': true,
      'importHelpers': true,
      'noEmitHelpers': true,
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
        '@skyux-sdk/builder/*': [
          '*'
        ],
        '.skypageslocales/*': [
          '../src/assets/locales/*'
        ]
      }
    },
    'files': getEntryPointFiles()
  };

  fs.writeJSONSync(skyPagesConfigUtil.spaPathTemp('tsconfig.json'), config);
}

/**
 * Create a "placeholder" module for Angular AoT compiler.
 * This is needed to avoid breaking changes; in the future,
 * we should require a module name be provided by the consumer.
 */
function writePlaceholderModule() {
  const content = `import { NgModule } from '@angular/core';
export * from './index';
@NgModule({})
export class SkyLibPlaceholderModule {}
`;

  fs.writeFileSync(skyPagesConfigUtil.spaPathTemp('main.ts'), content, {
    encoding: 'utf8'
  });
}

function processFiles(skyPagesConfig) {
  const pluginFileProcessor = require('../lib/plugin-file-processor');
  pluginFileProcessor.processFiles(
    skyPagesConfig,
    skyPagesConfigUtil.spaPathTemp('**', '*.*')
  );
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
      skyPagesConfigUtil.spaPath('node_modules', '.bin', 'ngc'),
      [
        '--project',
        skyPagesConfigUtil.spaPathTemp('tsconfig.json')
      ],
      { stdio: 'inherit' }
    );

    // Catch ngc errors.
    if (result.err) {
      reject(result.err);
      return;
    }

    // Catch non-zero status codes.
    if (result.status !== 0) {
      reject(new Error(`Angular compiler (ngc) exited with status code ${result.status}.`));
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
  processFiles(skyPagesConfig);

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
