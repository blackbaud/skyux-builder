/*jshint node: true*/
'use strict';

const path = require('path');
const fs = require('fs');
const hashFile = require('hash-file');

const loaderUtils = require('loader-utils');
const skyPagesConfigUtil = require('../../config/sky-pages/sky-pages.config');

const ASSETS_REGEX = /~\/assets\/.*\.[\.\w]*/gi;

function getFilePathWithHash(filePath) {
  let filePathParts = filePath.split('.');

  return filePathParts[0] +
    '.' +
    hashFile.sync(skyPagesConfigUtil.spaPath('src', filePath)) +
    '.' +
    filePathParts[1];
}

module.exports = function (content) {
  let i;
  let n;

  let matches = content.match(ASSETS_REGEX);

  if (matches) {
    const options = loaderUtils.getOptions(this);

    for (i = 0, n = matches.length; i < n; i++) {
      const match = matches[0];

      const filePath = match.substring(2, match.length);
      const filePathWithHash = getFilePathWithHash(filePath);

      this.emitFile(
        path.join(filePathWithHash),
        fs.readFileSync(skyPagesConfigUtil.spaPath('src', filePath))
      );

      const url = `${options && options.baseUrl}${filePathWithHash}`;

      content = content.replace(
        new RegExp(match, 'gi'),
        url
      );
    }
  }

  return content;

};
