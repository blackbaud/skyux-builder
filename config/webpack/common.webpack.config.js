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

/**
 * Sets an alias to the specified module using the SPA path if the file exists in the SPA;
 * otherwise it sets the alias to the file in SKY UX Builder.
 * @name setSpaAlias
 * @param {Object} alias
 * @param {String} moduleName
 * @param {String} path
 */
function setSpaAlias(alias, moduleName, path) {
  let resolvedPath = spaPath(path);

  if (!fs.existsSync(resolvedPath)) {
    resolvedPath = outPath(path);
  }

  alias['sky-pages-internal/' + moduleName] = resolvedPath;
}

/**
 * Called when loaded via require.
 * @name getWebpackConfig
 * @param {SkyPagesConfig} skyPagesConfig
 * @returns {WebpackConfig} webpackConfig
 */
function getWebpackConfig(skyPagesConfig) {

  const resolves = [
    process.cwd(),
    spaPath('node_modules'),
    outPath('node_modules')
  ];

  let alias = {
    'sky-pages-spa/src': spaPath('src'),
    'sky-pages-internal/runtime': outPath('runtime')
  };

  if (skyPagesConfig && skyPagesConfig.skyux) {
    // Order here is very important; the more specific CSS alias must go before
    // the more generic dist one.
    if (skyPagesConfig.skyux.cssPath) {
      alias['@blackbaud/skyux/dist/css/sky.css'] = spaPath(skyPagesConfig.skyux.cssPath);
    }

    if (skyPagesConfig.skyux.importPath) {
      alias['@blackbaud/skyux/dist'] = spaPath(skyPagesConfig.skyux.importPath);
    }
  }

  setSpaAlias(alias, 'src/app/app-extras.module', path.join('src', 'app', 'app-extras.module.ts'));
  setSpaAlias(alias, 'src/main', path.join('src', 'main.ts'));

  const outConfigMode = skyPagesConfig && skyPagesConfig.mode;
  let appPath;

  switch (outConfigMode) {
    case 'advanced':
      appPath = spaPath('src', 'main.ts');
      break;
    default:
      appPath = outPath('src', 'main-internal.ts');
      break;
  }

  // Merge in our defaults
  const appConfig = merge((skyPagesConfig && skyPagesConfig.app) || {}, {
    template: outPath('src', 'main.ejs'),
    base: skyPagesConfigUtil.getAppBase(skyPagesConfig),
    inject: false
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
          loader: outPath('loader', 'sky-pages-module')
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
