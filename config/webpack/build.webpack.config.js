/*jslint node: true */
'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const ChunkManifestPlugin = require('chunk-manifest-webpack-plugin');

/**
 * Writes a json object to the dist folder.
 * @name writeFileToDist
 * @param {String} name
 * @param {String} json
 */
const writeJson = (name, json) => {
  fs.writeFileSync(
    path.join(process.cwd(), 'dist', name),
    JSON.stringify(json, null, '\t')
  );
};

/**
 * Saves the stats.json file
 * @name SaveStats
 */
const SaveStats = function SaveStats() {
  this.plugin('done', (stats) => {
    writeJson('stats.json', stats.toJson());
  });
};

/**
 * Saves the metadata.json file.
 * Used to store order, fallback variable, etc.
 * @name SaveMetadata
 */
const SaveMetadata = function SaveMetadata() {
  const metadata = [];

  this.plugin('emit', (compilation, done) => {
    const formatName = 'SKY_PAGES_READY_%s';
    const formatDeclare = '%s\nvar %s = true;\n';

    // Only care about JS files
    Object.keys(compilation.assets).forEach((key) => {

      const parsed = path.parse(key);
      if (parsed.ext !== '.js') {
        return;
      }

      const asset = compilation.assets[key];
      const source = asset.source();
      const fallback = util.format(formatName, parsed.name.toUpperCase());

      // Add our variable to the bottom of the source file
      asset.source = () => util.format(formatDeclare, source, fallback);
      metadata.push({
        name: key,
        fallback: fallback
      });
    });
    done();
  });

  this.plugin('done', () => {
    writeJson('metadata.json', metadata);
  });
};

/**
 * Returns the default webpackConfig.
 * @name getDefaultWebpackConfig
 * @returns {WebpackConfig} webpackConfig
 */
const getWebpackConfig = (skyPagesConfig) => {
  const common = require('./common.webpack.config');
  const skyPagesConfigServe = webpackMerge(skyPagesConfig, {
    command: 'build'
  });

  return webpackMerge(common.getWebpackConfig(skyPagesConfigServe), {
    devtool: 'source-map',
    plugins: [
      SaveStats,
      SaveMetadata,
      new webpack.optimize.DedupePlugin(),
      new ChunkManifestPlugin({
        filename: 'manifest.json',
        manifestVariable: 'webpackManifest'
      }),
      new webpack.optimize.UglifyJsPlugin({
        beautify: false,
        comments: false,
        compress: { warnings: false },
        mangle: { screw_ie8: true, keep_fnames: true }
      })
    ]
  });
};

module.exports = {
  getWebpackConfig: getWebpackConfig
};
