const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

/**
 * Called when loaded via require.
 * @name getExports
 * @param {SkyPagesConfig} skyPagesConfig
 * @returns {WebpackConfig} webpackConfig
 */
const getExports = (skyPagesConfig) => {

  const extractCSS = new ExtractTextPlugin('stylesheets/[name].[hash].css')
  const assetLoader = path.resolve(__dirname, '..', 'sky-pages-asset-loader');
  const moduleLoader = path.resolve(__dirname, '..', 'sky-pages-module-loader');
  const resolves = [
    path.join(__dirname, '..'),
    path.join(__dirname, '..', 'node_modules')
  ];

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
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        name: ['app', 'vendor', 'polyfills']
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, '..', 'src', 'index.html')
      }),
      extractCSS
    ]
  };
};

// Expose to require
module.exports = getExports;
