/*jslint node: true */
'use strict';

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const failPlugin = require('webpack-fail-plugin');

/**
 * Called when loaded via require.
 * @name getWebpackConfig
 * @param {SkyPagesConfig} skyPagesConfig
 * @returns {WebpackConfig} webpackConfig
 */
const getWebpackConfig = (skyPagesConfig) => {

  const appConfig = skyPagesConfig['blackbaud-sky-pages-out-skyux2'].app;
  const assetLoader = path.resolve(__dirname, '..', 'sky-pages-asset-loader');
  const moduleLoader = path.resolve(__dirname, '..', 'sky-pages-module-loader');
  const resolves = [
    path.join(__dirname, '..'),
    path.join(__dirname, '..', 'node_modules')
  ];

  // Add the default template unless user has overridden
  if (!appConfig.template) {
    appConfig.template = path.resolve(__dirname, '..', 'src', 'main.ejs');
  }

  return {
    entry: {
      polyfills: [path.resolve(__dirname, '..', 'src', 'polyfills.ts')],
      vendor: [path.resolve(__dirname, '..', 'src', 'vendor.ts')],
      app: [path.resolve(__dirname, '..', 'src', 'main.ts')]
    },
    output: {
      path: path.join(process.cwd(), 'dist')
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
        name: ['app', 'vendor', 'polyfills']
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: { warnings: false },
        mangle: { screw_ie8: true, keep_fnames: true }
      }),
      new webpack.DefinePlugin({
        'SKY_PAGES': JSON.stringify(skyPagesConfig)
      }),
      failPlugin
    ]
  };
};

module.exports = {
  getWebpackConfig: getWebpackConfig
};
