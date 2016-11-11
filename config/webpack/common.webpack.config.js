/*jslint node: true */
'use strict';

const fs = require('fs');
const path = require('path');
const merge = require('merge');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const failPlugin = require('webpack-fail-plugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
const ForkCheckerPlugin = require('awesome-typescript-loader').ForkCheckerPlugin;
const skyPagesConfigUtil = require('../sky-pages/sky-pages.config');

function spaPath() {
  return skyPagesConfigUtil.spaPath.apply(skyPagesConfigUtil, arguments);
}

function outPath() {
  return skyPagesConfigUtil.outPath.apply(skyPagesConfigUtil, arguments);
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

  let alias = {
    'sky-pages-spa/src': spaPath('src')
  };

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

  const outConfigMode = skyPagesOutConfig && skyPagesOutConfig.mode;
  let appPath;

  switch (outConfigMode) {
    case 'advanced':
      appPath = spaPath('src', 'main.ts');
      break;
    default:
      appPath = outPath('src', 'main.ts');
      break;
  }

  // Merge in our defaults
  const appConfig = merge((skyPagesOutConfig && skyPagesOutConfig.app) || {}, {
    template: outPath('src', 'main.ejs'),
    base: skyPagesConfigUtil.getAppBase(skyPagesConfig)
  });

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
          test: /sky-pages\.module\.ts$/,
          loader: moduleLoader
        },
        {
          enforce: 'pre',
          test: /app\.component\.html$/,
          loader: assetLoader,
          query: {
            key: 'appComponentTemplate'
          }
        },
        {
          enforce: 'pre',
          test: /app\.component\.scss$/,
          loader: assetLoader,
          query: {
            key: 'appComponentStyles'
          }
        },
        {
          test: /\.s?css$/,
          loader: 'raw-loader!sass-loader'
        },
        {
          test: /\.html$/,
          loader: 'raw-loader'
        },
        {
          test: /\.json$/,
          loader: 'json'
        }
      ]
    },
    plugins: [
      new ForkCheckerPlugin(),
      new HtmlWebpackPlugin(appConfig),
      new CommonsChunkPlugin({
        name: ['skyux', 'vendor', 'polyfills']
      }),
      new webpack.DefinePlugin({
        'SKY_PAGES': JSON.stringify(skyPagesConfig)
      }),
      new ProgressBarPlugin(),
      failPlugin,
      new LoaderOptionsPlugin({
        options: {
          SKY_PAGES: skyPagesConfig
        }
      }),
      new ContextReplacementPlugin(
        // The (\\|\/) piece accounts for path separators in *nix and Windows
        /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
        spaPath('src') // location of your src
      )
    ]
  };
}

module.exports = {
  getWebpackConfig: getWebpackConfig
};
