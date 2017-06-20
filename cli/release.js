
// 'clean': 'rimraf dist .srctmp && npm run clean:ngc',
// 'clean:ngc': 'rimraf **/*.ngsummary.json **/*.ngfactory.ts **/*.ngstyle.ts',
// 'prepare:ts': 'npm run clean && node ./scripts/stage-ts.js',
// 'prepare:package': 'node ./scripts/prepare-package.js',
// 'transpile': 'webpack --config ./config/webpack/webpack.bundle.config.js --progress',
// 'build': 'npm run clean && npm run prepare:ts && npm run transpile && npm run minify && npm run prepare:package && npm run clean:ngc',
// 'minify': 'uglifyjs dist/bundles/stache.umd.js --screw-ie8 --compress --mangle --comments --output dist/bundles/stache.umd.min.js',

const spawn = require('cross-spawn');
const fs = require('fs-extra');
const logger = require('winston');
const rimraf = require('rimraf');
const webpack = require('webpack');
const releaseConfig = require('../config/webpack/release.webpack.config.js');
const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');
const spawnOptions = { stdio: 'inherit' };

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

function stageTypeScriptFiles() {
  require('./utils/stage-ts')();
}

function preparePackage() {
  require('./utils/prepare-package')();
}

function transpile() {
  const config = releaseConfig.getWebpackConfig();
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

const build = () => {};

const minify = () => {};

const release = () => {
  console.log('RELEASE!');
  cleanAll();
  stageTypeScriptFiles();
  writeTSConfig();
  transpile().then(() => {
    preparePackage();
    // cleanTemp();
    process.exit();
  });
};

module.exports = release;
