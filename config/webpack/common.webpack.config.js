/*jslint node: true */
'use strict';

const path = require('path');
const merge = require('merge');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const failPlugin = require('webpack-fail-plugin');

/**
 * Reads the name field of package.json.
 * Removes "blackbaud-sky-pages-spa-" and wraps in "/".
 * @name getAppName
 * @returns {String} appName
 */
function getAppBase(skyPagesConfig) {
  let name;
  if (skyPagesConfig.name) {
    name = skyPagesConfig.name;
  } else {
    name = require(path.join(process.cwd(), 'package.json')).name;
  }

  return '/' + name.replace(/blackbaud-sky-pages-spa-/gi, '') + '/';
}

/**
 * Called when loaded via require.
 * @name getWebpackConfig
 * @param {SkyPagesConfig} skyPagesConfig
 * @returns {WebpackConfig} webpackConfig
 */
function getWebpackConfig(skyPagesConfig) {

  const assetLoader = path.resolve(__dirname, '..', '..', 'loader', 'sky-pages-asset');
  const moduleLoader = path.resolve(__dirname, '..', '..', 'loader', 'sky-pages-module');

  const skyPagesOutConfig = skyPagesConfig['blackbaud-sky-pages-out-skyux2'];

  const resolves = [
    process.cwd(),
    path.join(process.cwd(), 'node_modules'),
    path.join(__dirname, '..', '..', 'node_modules')
  ];

  let alias = {};

  if (skyPagesOutConfig && skyPagesOutConfig.skyux) {
    // Order here is very important; the more specific CSS alias must go before
    // the more generic dist one.
    if (skyPagesOutConfig.skyux.cssPath) {
      alias['blackbaud-skyux2/dist/css/sky.css'] = path.join(
        process.cwd(),
        skyPagesOutConfig.skyux.cssPath
      );
    }

    if (skyPagesOutConfig.skyux.importPath) {
      alias['blackbaud-skyux2/dist'] = path.join(
        process.cwd(),
        skyPagesOutConfig.skyux.importPath
      );
    }
  }

  let appPath;
  switch (skyPagesOutConfig.mode) {
    case 'advanced':
      appPath = path.join(process.cwd(), 'src', 'main.ts');
    break;
    default:
      appPath = path.resolve(__dirname, '..', '..', 'src', 'main.ts');
    break;
  }

  // Merge in our defaults
  const appConfig = merge(skyPagesOutConfig.app, {
    template: path.resolve(__dirname, '..', '..', 'src', 'main.ejs'),
    base: getAppBase(skyPagesConfig)
  });

  return {
    appConfig: appConfig,
    entry: {
      polyfills: [path.resolve(__dirname, '..', '..', 'src', 'polyfills.ts')],
      vendor: [path.resolve(__dirname, '..', '..', 'src', 'vendor.ts')],
      skyux: [path.resolve(__dirname, '..', '..', 'src', 'skyux.ts')],
      app: [appPath]
    },
    output: {
      filename: '[name].js',
      chunkFilename: '[id].chunk.js',
      path: path.join(process.cwd(), 'dist'),
    },
    resolveLoader: {
      root: resolves
    },
    resolve: {
      alias: alias,
      root: resolves,
      extensions: [
        '',
        '.js',
        '.ts'
      ],
    },
    module: {
      preLoaders: [
        {
          test: /sky-pages\.module\.ts$/,
          loader: moduleLoader
        },
        {
          test: /app\.component\.html$/,
          loader: assetLoader,
          query: {
            key: 'appComponentTemplate'
          }
        },
        {
          test: /app\.component\.scss$/,
          loader: assetLoader,
          query: {
            key: 'appComponentStyles'
          }
        }
      ],
      loaders: [
        {
          test: /\.ts$/,
          loaders: [
            'ts-loader?silent=true',
            'angular2-template-loader'
          ]
        },
        {
          test: /\.s?css$/,
          loader: 'raw-loader!sass-loader'
        },
        {
          test: /\.html$/,
          loader: 'raw-loader'
        }
      ]
    },
    SKY_PAGES: skyPagesConfig,
    plugins: [
      new HtmlWebpackPlugin(appConfig),
      new webpack.optimize.OccurenceOrderPlugin(true),
      new webpack.optimize.CommonsChunkPlugin({
        name: ['skyux', 'vendor', 'polyfills']
      }),
      new webpack.DefinePlugin({
        'SKY_PAGES': JSON.stringify(skyPagesConfig)
      }),
      new ProgressBarPlugin(),
      failPlugin
    ]
  };
}

module.exports = {
  getWebpackConfig: getWebpackConfig
};
