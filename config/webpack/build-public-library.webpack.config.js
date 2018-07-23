/*jslint node: true */
'use strict';

const ngtools = require('@ngtools/webpack');
const fs = require('fs-extra');
const webpack = require('webpack');
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

  let dependencies = [];
  if (builderPackageJson.dependencies) {
    dependencies = Object.keys(builderPackageJson.dependencies);
  }

  if (builderPackageJson.peerDependencies) {
    dependencies = dependencies.concat(Object.keys(builderPackageJson.peerDependencies));
  }

  if (spaPackageJson.dependencies) {
    dependencies = dependencies.concat(Object.keys(spaPackageJson.dependencies));
  }

  if (spaPackageJson.peerDependencies) {
    dependencies = dependencies.concat(Object.keys(spaPackageJson.peerDependencies));
  }

  // Remove duplicates from array.
  // https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
  const externals = [...new Set(dependencies)]
    .map(key => parseRegExp(key));

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
      // Generates an AoT JavaScript bundle.
      // TODO: Remove this in favor of Angular's native library bundler,
      // once we've upgraded to Angular version 6.
      new ngtools.AotPlugin({
        tsConfigPath: skyPagesConfigUtil.spaPathTemp('tsconfig.json'),
        entryModule: skyPagesConfigUtil.spaPathTemp('main.ts') + '#SkyLibPlaceholderModule',
        sourceMap: true
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
