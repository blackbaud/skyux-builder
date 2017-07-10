/*jshint node: true*/
'use strict';

const fs = require('fs');
const loaderUtils = require('loader-utils');

const skyPagesConfigUtil = require('../../config/sky-pages/sky-pages.config');
const assetsUtils = require('../../utils/assets-utils');

const ASSETS_REGEX = /~\/assets\/.*\.[\.\w]*/gi;

module.exports = function (content) {
  const options = loaderUtils.getOptions(this);
  let match = ASSETS_REGEX.exec(content);

  while (match) {
    const matchString = match[0];
    const filePath = matchString.substring(2, matchString.length);
    const filePathWithHash = assetsUtils.getFilePathWithHash(filePath, true);

    this.emitFile(
      filePathWithHash,
      fs.readFileSync(skyPagesConfigUtil.spaPath('src', filePath))
    );

    const url = `${options && options.baseUrl}${filePathWithHash.replace(/\\/gi, '/')}`;

    content = content.replace(
      new RegExp(matchString, 'gi'),
      url
    );

    match = ASSETS_REGEX.exec(content);
  }

  return content;
};
