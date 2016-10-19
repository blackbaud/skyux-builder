/*jslint node: true */
'use strict';

const fs = require('fs');
const path = require('path');
const merge = require('merge');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const failPlugin = require('webpack-fail-plugin');

/**
 * Takes one or more path parts and returns the fully-qualified path to the file
 * contained in this project (sky-pages-out-skyux2).
 * @returns {String} The fully-qualified path.
 */
function outPath() {
  let args = [__dirname, '..', '..'].concat(Array.prototype.slice.call(arguments));
  return path.resolve.apply(path, args);
}

/**
 * Takes one or more path parts and returns the fully-qualified path to the file
 * contained in the SPA project.
 * @returns {String} The fully-qualified path.
 */
function spaPath() {
  let args = [process.cwd()].concat(Array.prototype.slice.call(arguments));
  return path.resolve.apply(path, args);
}

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
    name = require(spaPath('package.json')).name;
  }

  return '/' + name.replace(/blackbaud-sky-pages-spa-/gi, '') + '/';
}

function setAppExtrasAlias(alias) {
  let appExtrasPath = path.join('src', 'app', 'app-extras.module.ts');
  let appExtrasResolvedPath = spaPath(appExtrasPath);

  if (!fs.existsSync(appExtrasResolvedPath)) {
    appExtrasResolvedPath = outPath(appExtrasPath);
  }

  alias['sky-pages-internal/app-extras.module'] = appExtrasResolvedPath;
}
/**
 * Called when loaded via require.
 * @name getWebpackConfig
 * @param {SkyPagesConfig} skyPagesConfig
 * @returns {WebpackConfig} webpackConfig
 */
function getWebpackConfig(skyPagesConfig) {

  const assetLoader = outPath('loader', 'sky-pages-asset');
  const moduleLoader = outPath('loader', 'sky-pages-module');

  const skyPagesOutConfig = skyPagesConfig['blackbaud-sky-pages-out-skyux2'];

  const resolves = [
    process.cwd(),
    spaPath('node_modules'),
    outPath('node_modules')
  ];

  let alias = {};

  if (skyPagesOutConfig && skyPagesOutConfig.skyux) {
    // Order here is very important; the more specific CSS alias must go before
    // the more generic dist one.
    if (skyPagesOutConfig.skyux.cssPath) {
      alias['blackbaud-skyux2/dist/css/sky.css'] = spaPath(skyPagesOutConfig.skyux.cssPath);
    }

    if (skyPagesOutConfig.skyux.importPath) {
      alias['blackbaud-skyux2/dist'] = spaPath(skyPagesOutConfig.skyux.importPath);
    }
  }

  setAppExtrasAlias(alias);

  let appPath;
  switch (skyPagesOutConfig.mode) {
    case 'advanced':
      appPath = spaPath('src', 'main.ts');
      break;
    default:
      appPath = outPath('src', 'main.ts');
      break;
  }

  // Merge in our defaults
  const appConfig = merge(skyPagesOutConfig.app, {
    template: outPath('src', 'main.ejs'),
    base: getAppBase(skyPagesConfig)
  });

  return {
    appConfig: appConfig,
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
      root: resolves
    },
    resolve: {
      alias: alias,
      root: resolves,
      fallback: resolves,
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
