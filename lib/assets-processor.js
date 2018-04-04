/*jshint node: true*/
'use strict';

const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');
const assetsUtils = require('../utils/assets-utils');

const {
  isLocaleFile,
  resolvePhysicalLocaleFilePath,
  resolveRelativeLocaleFileDestination
} = require('./locale-assets-processor');

const ASSETS_REGEX = /~\/assets\/.*?\.[\.\w]+/gi;

/**
 * Gets the assets URL with the application's root directory appended to it.
 * @param {*} skyPagesConfig The SKY UX app config.
 * @param {*} baseUrl The base URL where the assets will be served.
 * @param {*} rel An additional relative path to append to the assets base URL
 * once the application's root directory has been appended.
 */
function getAssetsUrl(skyPagesConfig, baseUrl, rel) {
  return baseUrl + skyPagesConfig.runtime.app.base + (rel || '');
}

/**
 * Finds referenced assets in a file and replaces occurrences in the file's
 * contents with the absolute URL.
 * @param {*} content The file contents.
 * @param {*} baseUrl The base URL where the assets will be served.
 * @param {*} callback A function to call for each found asset path. The function will be
 * provided the file path with a file hash added to the file name along with the
 * physical path to the file.
 */
function processAssets(content, baseUrl, callback) {
  let match = ASSETS_REGEX.exec(content);

  while (match) {
    const matchString = match[0];

    let filePath;
    let filePathWithHash;

    if (isLocaleFile(matchString)) {
      filePath = resolvePhysicalLocaleFilePath(matchString);
      filePathWithHash = resolveRelativeLocaleFileDestination(
        assetsUtils.getFilePathWithHash(filePath, true)
      );
    } else {
      filePath = matchString.substring(2, matchString.length);
      filePathWithHash = assetsUtils.getFilePathWithHash(filePath, true);
    }

    if (callback) {
      callback(filePathWithHash, skyPagesConfigUtil.spaPath('src', filePath));
    }

    const url = `${baseUrl}${filePathWithHash.replace(/\\/gi, '/')}`;

    content = content.replace(
      new RegExp(matchString, 'gi'),
      url
    );

    match = ASSETS_REGEX.exec(content);
  }

  return content;
}

/**
 * Sets the assets URL on Webpack loaders that reference it.
 * @param {*} webpackConfig The Webpack config object.
 * @param {*} skyPagesConfig The SKY UX app config.
 * @param {*} baseUrl The base URL where the assets will be served.
 * @param {*} rel An additional relative path to append to the assets base URL
 * once the application's root directory has been appended.
 */
function setSkyAssetsLoaderUrl(webpackConfig, skyPagesConfig, baseUrl, rel) {
  const rules = webpackConfig &&
    webpackConfig.module &&
    webpackConfig.module.rules;

  if (rules) {
    const assetsRule = rules.find(rule => /sky-assets$/.test(rule.loader));
    assetsRule.options = assetsRule.options || {};
    assetsRule.options.baseUrl = getAssetsUrl(skyPagesConfig, baseUrl, rel);
  }
}

module.exports = {
  getAssetsUrl,
  setSkyAssetsLoaderUrl,
  processAssets
};
