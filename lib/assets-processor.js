/*jshint node: true*/
'use strict';

const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');
const assetsUtils = require('../utils/assets-utils');

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
 * @param {*} cb A function to call for each found asset path. The function will be
 * provided the file path with a file hash added to the file name along with the
 * physical path to the file.
 */
function processAssets(content, baseUrl, cb) {
  let match = ASSETS_REGEX.exec(content);

  while (match) {
    const matchString = match[0];
    const filePath = matchString.substring(2, matchString.length);
    const filePathWithHash = assetsUtils.getFilePathWithHash(filePath, true);

    if (cb) {
      cb(filePathWithHash, skyPagesConfigUtil.spaPath('src', filePath));
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
 * @param {*} config The Webpack config object.
 * @param {*} skyPagesConfig The SKY UX app config.
 * @param {*} baseUrl The base URL where the assets will be served.
 * @param {*} rel An additional relative path to append to the assets base URL
 * once the application's root directory has been appended.
 */
function setSkyAssetsLoaderUrl(config, skyPagesConfig, baseUrl, rel) {
  let i;
  let n;

  const rules = config && config.module && config.module.rules;

  if (rules) {
    for (i = 0, n = rules.length; i < n; i++) {
      let rule = rules[i];

      if (rule.loader && rule.loader.match(/sky-assets$/)) {
        rule.options = rule.options || {};
        rule.options.baseUrl = getAssetsUrl(skyPagesConfig, baseUrl, rel);

        return;
      }
    }
  }
}

module.exports = {
  getAssetsUrl: getAssetsUrl,
  setSkyAssetsLoaderUrl: setSkyAssetsLoaderUrl,
  processAssets: processAssets
};
