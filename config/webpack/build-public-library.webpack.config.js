/*jslint node: true */
'use strict';

const webpack = require('webpack');
const ngcWebpack = require('ngc-webpack');
const skyPagesConfigUtil = require('../sky-pages/sky-pages.config');

function getWebpackConfig(skyPagesConfig) {
  const libraryName = skyPagesConfig.skyux.name || 'SkyAppLibrary';
  return {
    entry: skyPagesConfigUtil.spaPathTemp('index.ts'),
    output: {
      path: skyPagesConfigUtil.spaPath('dist', 'bundles'),
      filename: 'bundle.umd.js',
      libraryTarget: 'umd',
      library: libraryName
    },
    externals: [
      /^@angular\//,
      /^@blackbaud\//,
      /^rxjs\//
    ],
    resolve: {
      extensions: ['.js', '.ts']
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: ['awesome-typescript-loader', 'angular2-template-loader'],
          exclude: [/\.(spec|e2e)\.ts$/]
        },
        {
          test: /\.html$/,
          use: 'raw-loader'
        },
        {
          test: /\.scss$/,
          use: ['raw-loader', 'sass-loader']
        },
        {
          test: /\.css$/,
          use: ['raw-loader', 'style-loader']
        }
      ]
    },
    plugins: [
      new ngcWebpack.NgcWebpackPlugin({
        tsConfig: skyPagesConfigUtil.spaPathTemp('tsconfig.json')
      }),

      new webpack.optimize.UglifyJsPlugin({
        beautify: false,
        comments: false,
        compress: { warnings: false },
        mangle: { screw_ie8: true, keep_fnames: true }
      })
    ]
  };
}

module.exports = {
  getWebpackConfig: getWebpackConfig
};
