/*jslint node: true */
'use strict';

const webpackMerge = require('webpack-merge');
const skyPagesConfigUtil = require('../sky-pages/sky-pages.config');

module.exports = {
  getWebpackConfig(skyPagesConfig) {
    const command = skyPagesConfig.command || 'serve';
    const files = skyPagesConfig.webpackConfigs && skyPagesConfig.webpackConfigs[command];
    let config = {};

    if (files) {
      files.forEach(filePath => {
        let resolvedPath = skyPagesConfigUtil.spaPath(filePath);
        let contents = require(resolvedPath);
        config = webpackMerge(config, contents);
      });
    }

    return config;
  }
};
