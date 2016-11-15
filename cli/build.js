/*jshint node: true*/
'use strict';

const logger = require('winston');
const fs = require('fs-extra');
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
  let outConfig = skyPagesConfig['blackbaud-sky-pages-out-skyux2'];

  let skyuxImportPath = (outConfig && outConfig.skyux && outConfig.skyux.importPath);

  if (skyuxImportPath) {
    skyuxImportPath = '../../' + skyuxImportPath;
  }

  const spaPathTempSrc = skyPagesConfigUtil.spaPathTempSrc();

  fs.ensureDirSync(spaPathTempSrc);
  fs.emptyDirSync(spaPathTempSrc);

  const skyPagesModuleSource = generator.getSource(
    skyPagesConfig,
    '.',
    '../..',
    skyuxImportPath,
    true
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
  const outConfig = skyPagesConfig['blackbaud-sky-pages-out-skyux2'];
  const compileModeIsAoT = outConfig && outConfig.compileMode === 'aot';

  let buildConfig;

  if (compileModeIsAoT) {
    stageAot(skyPagesConfig);
    buildConfig = require('../config/webpack/build-aot.webpack.config');
  } else {
    buildConfig = require('../config/webpack/build.webpack.config');
  }

  const config = buildConfig.getWebpackConfig(skyPagesConfig);
  const compiler = webpack(config);

  compiler.run((err, stats) => {
    if (err) {
      logger.error(err);
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
  });
}

module.exports = build;
