/*jslint node: true */
'use strict';

const path = require('path');
const merge = require('merge');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const failPlugin = require('webpack-fail-plugin');

/**
 * Reads the name field of package.json.
 * Removes "blackbaud-sky-pages-spa-" and wraps in "/".
 * @name getAppName
 * @returns {String} appName
 */
const getAppBase = () => {
  const name = require(path.join(process.cwd(), 'package.json')).name;
  return '/' + name.replace(/blackbaud-sky-pages-spa-/gi, '') + '/';
};

/**
 * Called when loaded via require.
 * @name getWebpackConfig
 * @param {SkyPagesConfig} skyPagesConfig
 * @returns {WebpackConfig} webpackConfig
 */
const getWebpackConfig = (skyPagesConfig) => {

  const assetLoader = path.resolve(__dirname, '..', '..', 'loader', 'sky-pages-asset');
  const moduleLoader = path.resolve(__dirname, '..', '..', 'loader', 'sky-pages-module');
  const resolves = [
    process.cwd(),
    path.join(process.cwd(), 'node_modules'),
    path.join(__dirname, '..'),
    path.join(__dirname, '..', 'node_modules'),
    path.join(process.cwd(), skyPagesConfig['blackbaud-sky-pages-out-skyux2'].skyux.importPath)
  ];

  let appPath;
  switch (skyPagesConfig['blackbaud-sky-pages-out-skyux2'].mode) {
    case 'advanced':
      appPath = path.join(process.cwd(), 'src', 'main.ts');
    break;
    default:
      appPath = path.resolve(__dirname, '..', '..', 'src', 'main.ts');
    break;
  }

  // Merge in our defaults
  const appConfig = merge(skyPagesConfig['blackbaud-sky-pages-out-skyux2'].app, {
    template: path.resolve(__dirname, '..', '..', 'src', 'main.ejs'),
    base: getAppBase()
  });

  return {
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
      publicPath: appConfig.base
    },
    resolveLoader: {
      root: resolves
    },
    resolve: {
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
      new webpack.optimize.CommonsChunkPlugin({
        name: ['app', 'skyux', 'vendor', 'polyfills']
      }),
      new webpack.DefinePlugin({
        'SKY_PAGES': JSON.stringify(skyPagesConfig)
      }),
      new ProgressBarPlugin(),
      new WebpackMd5Hash(),
      failPlugin
    ]
  };
};

module.exports = {
  getWebpackConfig: getWebpackConfig
};
