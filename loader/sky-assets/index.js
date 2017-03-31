/*jshint node: true*/
'use strict';

const fs = require('fs');
const hashFile = require('hash-file');

const loaderUtils = require('loader-utils');
const skyPagesConfigUtil = require('../../config/sky-pages/sky-pages.config');

const ASSETS_REGEX = /~\/assets\/.*\.[\.\w]*/gi;

function getFilePathWithHash(filePath) {
  let indexOfLastDot = filePath.lastIndexOf('.');

  return filePath.substr(0, indexOfLastDot) +
    '.' +
    hashFile.sync(skyPagesConfigUtil.spaPath('src', filePath)) +
    '.' +
    filePath.substr(indexOfLastDot + 1);
}

module.exports = function (content) {
  const options = loaderUtils.getOptions(this);
  let match = ASSETS_REGEX.exec(content);

  while (match) {
    const matchString = match[0];
    const filePath = matchString.substring(2, matchString.length);
    const filePathWithHash = getFilePathWithHash(filePath);

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
