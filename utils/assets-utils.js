/*jshint node: true*/
'use strict';

const hashFile = require('hash-file');
const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');

/**
 * Appends the hash of the specified file to the end of the file path.
 * @param {*} filePath The path to the file.
 * @param {*} rel Optional Boolean flag indicating whether the returned path should be relative
 * to the app's src path.
 */
function getFilePathWithHash(filePath, rel) {
  const indexOfLastDot = filePath.lastIndexOf('.');

  let filePathWithHash = filePath.substr(0, indexOfLastDot) +
    '.' +
    hashFile.sync(skyPagesConfigUtil.spaPath('src', filePath)) +
    '.' +
    filePath.substr(indexOfLastDot + 1);

  if (!rel) {
    const srcPath = skyPagesConfigUtil.spaPath('src');
    filePathWithHash = filePathWithHash.substr(srcPath.length + 1);
  }

  return filePathWithHash;
}

/**
 * Gets the URL to a hashed file name.
 * @param {*} baseUrl The base of the URL where the page is being served.
 * @param {*} filePath The path to the file.
 */
function getUrl(baseUrl, filePath) {
  const filePathWithHash = getFilePathWithHash(filePath);

  const url = `${baseUrl}${filePathWithHash.replace(/\\/gi, '/')}`;

  return url;
}

module.exports = {
  getFilePathWithHash: getFilePathWithHash,
  getUrl: getUrl
};
