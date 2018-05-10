/*jshint node: true*/
'use strict';

const fs = require('fs-extra');
const merge = require('../../utils/merge');

const skyPagesConfigUtil = require('../../config/sky-pages/sky-pages.config');
const generator = require('../../lib/sky-pages-module-generator');
const assetsProcessor = require('../../lib/assets-processor');
const pluginFileProcessor = require('../../lib/plugin-file-processor');
const localeAssetsProcessor = require('../../lib/locale-assets-processor');

const server = require('./server');
const browser = require('./browser');
const runCompiler = require('./run-compiler');
const tsLinter = require('./ts-linter');

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
      'node_modules',
      skyPagesConfigUtil.outPath('node_modules'),
      '**/*.spec.ts'
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

function stageAot(skyPagesConfig, assetsBaseUrl, assetsRel) {
  let skyPagesConfigOverrides = {
    runtime: {
      spaPathAlias: '../..',
      skyPagesOutAlias: '../..',
      // These files won't be copied to the temp folder because the consuming project will
      // be referencing it by its Node package name.  Make sure this code also references its
      // Node package name rather than a local path; otherwise TypeScript will treat them as
      // different types and Angular will throw an error when trying to inject an instance
      // of a class (such as SkyAuthHttp) by its type.
      runtimeAlias: '@blackbaud/skyux-builder/runtime',
      useTemplateUrl: true
    }
  };

  if (skyPagesConfig && skyPagesConfig.skyux && skyPagesConfig.skyux.importPath) {
    skyPagesConfigOverrides.runtime.skyuxPathAlias = '../../' + skyPagesConfig.skyux.importPath;
  }

  const spaPathTempSrc = skyPagesConfigUtil.spaPathTempSrc();

  fs.ensureDirSync(spaPathTempSrc);
  fs.emptyDirSync(spaPathTempSrc);

  merge(skyPagesConfig, skyPagesConfigOverrides);
  let skyPagesModuleSource = generator.getSource(skyPagesConfig);

  // The Webpack loader that processes referenced asset files will have run and emitted
  // the appropriate files, but the AoT compiler will not pick up changes to the contents
  // of the sky-pages.module.ts file.  Process the file again to do the replacements
  // before writing the file to disk.
  skyPagesModuleSource = assetsProcessor.processAssets(
    skyPagesModuleSource,
    assetsProcessor.getAssetsUrl(skyPagesConfig, assetsBaseUrl, assetsRel)
  );

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

  pluginFileProcessor.processFiles(skyPagesConfig);
  writeTSConfig();
}

function cleanupAot() {
  fs.removeSync(skyPagesConfigUtil.spaPathTemp());
}

function buildServe(argv, skyPagesConfig, webpack, isAot) {
  const base = skyPagesConfigUtil.getAppBase(skyPagesConfig);
  return server
    .start(base)
    .then(port => {
      argv.assets = argv.assets || `https://localhost:${port}`;
      return buildCompiler(argv, skyPagesConfig, webpack, isAot)
        .then(stats => {
          browser(argv, skyPagesConfig, stats, port);
          return stats;
        });
    });
}

function buildCompiler(argv, skyPagesConfig, webpack, isAot) {
  const assetsBaseUrl = argv.assets || '';
  const assetsRel = argv.assetsrel;

  let buildConfig;

  if (isAot) {
    stageAot(skyPagesConfig, assetsBaseUrl, assetsRel);
    buildConfig = require('../../config/webpack/build-aot.webpack.config');
  } else {
    buildConfig = require('../../config/webpack/build.webpack.config');
  }

  const config = buildConfig.getWebpackConfig(skyPagesConfig, argv);
  assetsProcessor.setSkyAssetsLoaderUrl(config, skyPagesConfig, assetsBaseUrl, assetsRel);

  return runCompiler(webpack, config, isAot)
    .then((stats) => {
      if (isAot) {
        cleanupAot();
      }

      return stats;
    });
}

/**
 * Executes the build command.
 * @name build
 * @param {*} skyPagesConfig
 * @param {*} webpack
 * @param {*} isAot
 * @param {*} cancelProcessExit
 */
function build(argv, skyPagesConfig, webpack) {

  const lintResult = tsLinter.lintSync();
  const isAot = skyPagesConfig &&
    skyPagesConfig.skyux &&
    skyPagesConfig.skyux.compileMode === 'aot';

  if (lintResult.exitCode > 0) {
    return Promise.reject(lintResult.errors);
  } else {
    localeAssetsProcessor.prepareLocaleFiles();
    const name = argv.serve ? buildServe : buildCompiler;

    return name(argv, skyPagesConfig, webpack, isAot);
  }
}

module.exports = build;
