/*jshint node: true*/
'use strict';

const fs = require('fs-extra');
const logger = require('winston');
const rimraf = require('rimraf');
const webpack = require('webpack');

const stageTypeScriptFiles = require('./utils/stage-library-ts');
const preparePackage = require('./utils/prepare-library-package');
const webpackConfig = require('../config/webpack/build-public-library.webpack.config.js');
const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');

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
      'rootDir': skyPagesConfigUtil.spaPathTemp()
    },
    'files': [
      skyPagesConfigUtil.spaPathTemp('index.ts')
    ]
  };

  fs.writeJSONSync(skyPagesConfigUtil.spaPathTemp('tsconfig.json'), config);
}

function transpile() {
  const config = webpackConfig.getWebpackConfig();
  const compiler = webpack(config);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        logger.error(err);
        reject(err);
        return;
      }

      const jsonStats = stats.toJson();

      if (jsonStats.errors.length) {
        logger.error(jsonStats.errors);
      }

      if (jsonStats.warnings.length) {
        logger.warn(jsonStats.warnings);
      }

      logger.info(stats.toString({
        chunks: false,
        colors: false
      }));

      resolve(stats);
    });
  });
}

module.exports = () => {
  cleanAll();
  stageTypeScriptFiles();
  writeTSConfig();

  return transpile()
    .then(() => {
      preparePackage();
      cleanTemp();
      process.exit(0);
    })
    .catch(() => {
      cleanAll();
      process.exit(1);
    });
};
