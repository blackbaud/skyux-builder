/*jshint node: true*/
'use strict';

const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');
const assetsUtils = require('../utils/assets-utils');

const ASSETS_REGEX = /~\/assets\/.*\.[\.\w]*/gi;

function getAssetsUrl(skyPagesConfig, baseUrl) {
  return baseUrl + skyPagesConfig.runtime.app.base;
}

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

function setSkyAssetsLoaderUrl(config, skyPagesConfig, localUrl) {
  let i;
  let n;

  const rules = config && config.module && config.module.rules;

  if (rules) {
    for (i = 0, n = rules.length; i < n; i++) {
      let rule = rules[i];

      if (rule.loader && rule.loader.match(/sky-assets$/)) {
        rule.options = rule.options || {};
        rule.options.baseUrl = getAssetsUrl(skyPagesConfig, localUrl);

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
