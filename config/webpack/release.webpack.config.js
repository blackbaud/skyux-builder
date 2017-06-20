/*jslint node: true */
'use strict';

const webpack = require('webpack');
const ngcWebpack = require('ngc-webpack');
const skyPagesConfigUtil = require('../sky-pages/sky-pages.config');

function getWebpackConfig(skyPagesConfig) {
  return {
    entry: skyPagesConfigUtil.spaPathTemp('index.ts'),
    output: {
      path: skyPagesConfigUtil.spaPath('dist', 'bundles'),
      filename: 'stache.umd.js',
      libraryTarget: 'umd',
      library: 'Stache'
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
          use: ['awesome-typescript-loader','angular2-template-loader'],
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
      // new webpack.ContextReplacementPlugin(
      //   // The (\\|\/) piece accounts for path separators in *nix and Windows
      //   /angular(\\|\/)core(\\|\/)@angular/,
      //   skyPagesConfigUtil.spaPath('src'),
      //   {}
      // ),

      new ngcWebpack.NgcWebpackPlugin({
        tsConfig: skyPagesConfigUtil.spaPathTemp('tsconfig.json')
      })
    ]
  };
}

module.exports = {
  getWebpackConfig: getWebpackConfig
};
