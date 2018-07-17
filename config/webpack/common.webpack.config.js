/*jslint node: true */
'use strict';

const logger = require('@blackbaud/skyux-logger');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
const { OutputKeepAlivePlugin } = require('../../plugin/output-keep-alive');
const skyPagesConfigUtil = require('../sky-pages/sky-pages.config');
const aliasBuilder = require('./alias-builder');

function spaPath() {
  return skyPagesConfigUtil.spaPath.apply(skyPagesConfigUtil, arguments);
}

function outPath() {
  return skyPagesConfigUtil.outPath.apply(skyPagesConfigUtil, arguments);
}

function getLogFormat(skyPagesConfig, argv) {
  if (argv.hasOwnProperty('logFormat')) {
    return argv.logFormat;
  }

  if (skyPagesConfig.runtime.command === 'serve' || argv.serve) {
    return 'compact';
  }

  return 'expanded';
}

/**
 * Called when loaded via require.
 * @name getWebpackConfig
 * @param {SkyPagesConfig} skyPagesConfig
 * @returns {WebpackConfig} webpackConfig
 */
function getWebpackConfig(skyPagesConfig, argv = {}) {
  const resolves = [
    process.cwd(),
    spaPath('node_modules'),
    outPath('node_modules')
  ];

  let alias = aliasBuilder.buildAliasList(skyPagesConfig);

  const outConfigMode = skyPagesConfig && skyPagesConfig.skyux && skyPagesConfig.skyux.mode;
  const logFormat = getLogFormat(skyPagesConfig, argv);

  let appPath;

  switch (outConfigMode) {
    case 'advanced':
      appPath = spaPath('src', 'main.ts');
      break;

    default:
      appPath = outPath('src', 'main-internal.ts');
      break;
  }

  let plugins = [
    // Some properties are required on the root object passed to HtmlWebpackPlugin
    new HtmlWebpackPlugin({
      template: skyPagesConfig.runtime.app.template,
      inject: skyPagesConfig.runtime.app.inject,
      runtime: skyPagesConfig.runtime,
      skyux: skyPagesConfig.skyux
    }),

    new CommonsChunkPlugin({
      name: ['skyux', 'vendor', 'polyfills']
    }),

    new webpack.DefinePlugin({
      'skyPagesConfig': JSON.stringify(skyPagesConfig)
    }),

    new LoaderOptionsPlugin({
      options: {
        context: __dirname,
        skyPagesConfig: skyPagesConfig
      }
    }),

    new ContextReplacementPlugin(
      // The (\\|\/) piece accounts for path separators in *nix and Windows
      /angular(\\|\/)core(\\|\/)@angular/,
      spaPath('src'),
      {}
    ),

    new OutputKeepAlivePlugin({
      enabled: argv['output-keep-alive']
    })
  ];

  // Supporting a custom logging type of none
  if (logFormat !== 'none') {
    plugins.push(new SimpleProgressWebpackPlugin({
      format: logFormat,
      color: logger.logColor
    }));
  }

  return {
    entry: {
      polyfills: [outPath('src', 'polyfills.ts')],
      vendor: [outPath('src', 'vendor.ts')],
      skyux: [outPath('src', 'skyux.ts')],
      app: [appPath]
    },
    output: {
      filename: '[name].js',
      chunkFilename: '[id].chunk.js',
      path: spaPath('dist'),
    },
    resolveLoader: {
      modules: resolves
    },
    resolve: {
      alias: alias,
      modules: resolves,
      extensions: [
        '.js',
        '.ts'
      ]
    },
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /config\.ts$/,
          loader: outPath('loader', 'sky-app-config'),
          include: outPath('runtime')
        },
        {
          enforce: 'pre',
          test: [
            /\.(html|s?css)$/,
            /sky-pages\.module\.ts/
          ],
          loader: outPath('loader', 'sky-assets')
        },
        {
          enforce: 'pre',
          test: /sky-pages\.module\.ts$/,
          loader: outPath('loader', 'sky-pages-module')
        },
        {
          enforce: 'pre',
          loader: outPath('loader', 'sky-processor', 'preload'),
          include: spaPath('src'),
          exclude: /node_modules/
        },
        {
          test: /\.s?css$/,
          use: [
            'raw-loader',
            'sass-loader'
          ]
        },
        {
          test: /\.html$/,
          loader: 'raw-loader'
        },
        {
          test: /\.json$/,
          loader: 'json-loader'
        }
      ]
    },
    plugins
  };
}

module.exports = {
  getWebpackConfig: getWebpackConfig
};
