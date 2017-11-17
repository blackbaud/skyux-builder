/*jslint node: true */
'use strict';

const ngcWebpack = require('ngc-webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const skyPagesConfigUtil = require('../sky-pages/sky-pages.config');
const ProcessExitCode = require('../../plugin/process-exit-code');

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

      new UglifyJSPlugin({
        parallel: true,
        exclude: /node_modules/,
        uglifyOptions: {
          compress: {
            warnings: false
          },
          mangle: {
            keep_fnames: true
          }
        }
      }),

      // Webpack 2 behavior does not correctly return non-zero exit code.
      new ProcessExitCode()
    ]
  };
}

module.exports = {
  getWebpackConfig: getWebpackConfig
};
