/*jslint node: true */
'use strict';

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
const ProcessExitCode = require('../../plugin/process-exit-code');
const { OutputKeepAlivePlugin } = require('../../plugin/output-keep-alive');
const skyPagesConfigUtil = require('../sky-pages/sky-pages.config');
const aliasBuilder = require('./alias-builder');

function spaPath() {
  return skyPagesConfigUtil.spaPath.apply(skyPagesConfigUtil, arguments);
}

function outPath() {
  return skyPagesConfigUtil.outPath.apply(skyPagesConfigUtil, arguments);
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
  let appPath;

  switch (outConfigMode) {
    case 'advanced':
      appPath = spaPath('src', 'main.ts');
      break;

    default:
      appPath = outPath('src', 'main-internal.ts');
      break;
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
          test: /runtime\/config\.ts$/,
          loader: outPath('loader', 'sky-app-config')
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
        }
      ]
    },
    plugins: [
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

      new ProgressBarPlugin(),

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

      // Webpack 2 behavior does not correctly return non-zero exit code.
      new ProcessExitCode(),

      new OutputKeepAlivePlugin({
        enabled: argv['output-keep-alive']
      })
    ]
  };
}

module.exports = {
  getWebpackConfig: getWebpackConfig
};
