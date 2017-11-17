/*jslint node: true */
'use strict';

const webpackMerge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ngtools = require('@ngtools/webpack');
const skyPagesConfigUtil = require('../sky-pages/sky-pages.config');
const SaveMetadata = require('../../plugin/save-metadata');

/**
 * Returns the default webpackConfig.
 * @name getDefaultWebpackConfig
 * @returns {WebpackConfig} webpackConfig
 */
function getWebpackConfig(skyPagesConfig, argv) {
  const common = require('./common.webpack.config');

  // Webpackmege will attempt to merge each entries array, so we need to delete it
  let commonConfig = common.getWebpackConfig(skyPagesConfig, argv);
  commonConfig.entry = null;

  // Resolves aren't needed for AoT and will only slow the build down:
  commonConfig.resolveLoader = undefined;
  commonConfig.resolve.modules = undefined;

  // Since the preloader is executed against the file system during an AoT build,
  // we need to remove it from the webpack config, otherwise it will get executed twice.
  commonConfig.module.rules = commonConfig.module.rules
    .filter((rule) => {
      const isPreloader = /(\/|\\)sky-processor(\/|\\)/.test(rule.loader);
      return (!isPreloader);
    });

  return webpackMerge(commonConfig, {
    entry: {
      polyfills: [skyPagesConfigUtil.spaPathTempSrc('polyfills.ts')],
      vendor: [skyPagesConfigUtil.spaPathTempSrc('vendor.ts')],
      skyux: [skyPagesConfigUtil.spaPathTempSrc('skyux.ts')],
      app: [skyPagesConfigUtil.spaPathTempSrc('main-internal.aot.ts')]
    },
    // Disable sourcemaps for production:
    // https://webpack.js.org/configuration/devtool/#production
    // devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: '@ngtools/webpack',
          exclude: /\.spec\.ts$/
        }
      ]
    },
    plugins: [
      new ngtools.AotPlugin({
        tsConfigPath: skyPagesConfigUtil.spaPathTempSrc('tsconfig.json'),
        entryModule: skyPagesConfigUtil.spaPathTempSrc('app', 'app.module') + '#AppModule',
        // Type checking handled by Builder's ts-linter utility.
        typeChecking: false
      }),

      SaveMetadata,

      new UglifyJSPlugin({
        parallel: true,
        exclude: /node_modules/,
        uglifyOptions: {
          compress: {
            warnings: false
          },
          mangle: {
            keep_fnames: true
          }
        }
      })
    ]
  });
}

module.exports = {
  getWebpackConfig: getWebpackConfig
};
