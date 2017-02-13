/*jshint node: true*/
'use strict';

const logger = require('winston');
const fs = require('fs-extra');
const merge = require('merge');
const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');
const generator = require('../lib/sky-pages-module-generator');

function writeTSConfig() {
  var config = {
    'compilerOptions': {
      'target': 'es5',
      'module': 'es2015',
      'moduleResolution': 'node',
      'emitDecoratorMetadata': true,
      'experimentalDecorators': true,
      'sourceMap': true,
      'noEmitHelpers': true,
      'noImplicitAny': true,
      'rootDir': '.',
      'inlineSources': true,
      'declaration': true,
      'skipLibCheck': true,
      'lib': [
        'es2015',
        'dom'
      ],
      'types': [
        'jasmine',
        'node'
      ]
    },
    'files': [
      './app/app.module.ts'
    ],
    'exclude': [
      '../../node_modules'
    ],
    'compileOnSave': false,
    'buildOnSave': false,
    'angularCompilerOptions': {
      'debug': true,
      'genDir': './ngfactory',
      'skipMetadataEmit': true
    }
  };

  fs.writeJSONSync(skyPagesConfigUtil.spaPathTempSrc('tsconfig.json'), config);
}

function stageAot(skyPagesConfig) {
  let skyPagesConfigOverrides = {
    spaPathAlias: '../..',
    skyPagesOutAlias: '../..',
    // These files won't be copied to the temp folder because the consuming project will
    // be referencing it by its Node package name.  Make sure this code also references its
    // Node package name rather than a local path; otherwise TypeScript will treat them as
    // different types and Angular will throw an error when trying to inject an instance
    // of a class (such as SkyAuthHttp) by its type.
    runtimeAlias: '@blackbaud/skyux-builder/runtime',
    useTemplateUrl: true
  };

  if (skyPagesConfig && skyPagesConfig.skyux && skyPagesConfig.skyux.importPath) {
    skyPagesConfigOverrides.skyuxPathAlias = '../../' + skyPagesConfig.skyux.importPath;
  }

  const spaPathTempSrc = skyPagesConfigUtil.spaPathTempSrc();

  fs.ensureDirSync(spaPathTempSrc);
  fs.emptyDirSync(spaPathTempSrc);

  merge(skyPagesConfig, skyPagesConfigOverrides);
  const skyPagesModuleSource = generator.getSource(skyPagesConfig);

  fs.copySync(
    skyPagesConfigUtil.outPath('src'),
    spaPathTempSrc
  );

  fs.copySync(
    skyPagesConfigUtil.spaPath('src'),
    spaPathTempSrc
  );

  fs.writeFileSync(
    skyPagesConfigUtil.spaPathTempSrc('app', 'sky-pages.module.ts'),
    skyPagesModuleSource,
    {
      encoding: 'utf8'
    }
  );

  writeTSConfig();
}

function cleanupAot() {
  fs.removeSync(skyPagesConfigUtil.spaPathTemp());
}

/**
 * Executes the build command.
 * @name build
 */
function build(argv, skyPagesConfig, webpack) {
  const compileModeIsAoT = skyPagesConfig && skyPagesConfig.compileMode === 'aot';

  let buildConfig;

  if (compileModeIsAoT) {
    stageAot(skyPagesConfig);
    buildConfig = require('../config/webpack/build-aot.webpack.config');
  } else {
    buildConfig = require('../config/webpack/build.webpack.config');
  }

  const config = buildConfig.getWebpackConfig(skyPagesConfig);
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

      if (compileModeIsAoT) {
        cleanupAot();
      }

      resolve(stats);
    });
  });
}

module.exports = build;
