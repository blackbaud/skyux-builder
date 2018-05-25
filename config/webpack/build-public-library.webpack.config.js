/*jslint node: true */
'use strict';

const fs = require('fs-extra');
const webpack = require('webpack');
const ngcWebpack = require('ngc-webpack');
const skyPagesConfigUtil = require('../sky-pages/sky-pages.config');

function parseRegExp(name) {
  const escaped = name
    .replace(/\./g, String.raw`\.`)
    .replace(/\//g, String.raw`\/`)
    .replace(/\-/g, String.raw`\-`);
  return new RegExp(`^${escaped}`);
}

function getWebpackConfig(skyPagesConfig) {
  const libraryName = skyPagesConfig.skyux.name || 'SkyAppLibrary';

  const builderPackageJson = fs.readJsonSync(
    skyPagesConfigUtil.outPath('package.json')
  );

  const spaPackageJson = fs.readJsonSync(
    skyPagesConfigUtil.spaPath('package.json')
  );

  let builderDependencies = [];
  if (builderPackageJson.dependencies) {
    builderDependencies = Object.keys(builderPackageJson.dependencies)
      .map(key => parseRegExp(key));
  }

  let spaDependencies = [];
  if (spaPackageJson.dependencies) {
    spaDependencies = Object.keys(spaPackageJson.dependencies)
      .map(key => parseRegExp(key));
  }

  const externals = builderDependencies.concat(spaDependencies);

  return {
    entry: skyPagesConfigUtil.spaPathTemp('index.ts'),
    output: {
      path: skyPagesConfigUtil.spaPath('dist', 'bundles'),
      filename: 'bundle.umd.js',
      libraryTarget: 'umd',
      library: libraryName
    },
    externals,
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
