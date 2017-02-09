/*jslint node: true */
'use strict';

// HTML Webpack Plugin has already solved sorting the entries
const sorter = require('html-webpack-plugin/lib/chunksorter');

/**
 * Creates a resolved host url.
 * @param {string} url
 * @param {string} localUrl
 * @param {Array} chunks
 * @param {Object} skyPagesConfig
 */
function resolve(url, localUrl, chunks, skyPagesConfig) {
  let config = {
    scripts: getScripts(chunks),
    localUrl: localUrl
  };

  if (skyPagesConfig.app && skyPagesConfig.app.externals) {
    config.externals = skyPagesConfig.app.externals;
  }

  const delimeter = url.indexOf('?') === -1 ? '?' : '&';
  const encoded = new Buffer(JSON.stringify(config)).toString('base64');
  const resolved = `${skyPagesConfig.host.url}${url}${delimeter}local=true&_cfg=${encoded}`;

  return resolved;
}

/**
 * Sorts chunks into array of scripts.
 * @param {Array} chunks
 */
function getScripts(chunks) {
  let scripts = [];

  sorter.dependency(chunks).forEach((chunk) => {
    scripts.push({
      name: chunk.files[0]
    });
  });

  return scripts;
}

module.exports = {
  resolve: resolve,
  getScripts: getScripts
};
