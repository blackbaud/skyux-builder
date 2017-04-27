/*jslint node: true */
'use strict';

// HTML Webpack Plugin has already solved sorting the entries
const sorter = require('html-webpack-plugin/lib/chunksorter');
const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');
/**
 * Creates a resolved host url.
 * @param {string} url
 * @param {string} localUrl
 * @param {Array} chunks
 * @param {Object} skyPagesConfig
 */
function resolve(url, localUrl, chunks, skyPagesConfig) {
  let host = skyPagesConfig.skyux.host.url;
  let config = {
    scripts: getScripts(chunks),
    localUrl: localUrl
  };

  if (skyPagesConfig.skyux.app && skyPagesConfig.skyux.app.externals) {
    config.externals = skyPagesConfig.skyux.app.externals;
  }

  // Trim leading slash since getAppBase adds it
  if (url && url.charAt(0) === '/') {
    url = url.substring(1);
  }

  // Trim trailing slash since geAppBase adds it
  if (host && host.charAt(host.length - 1) === '/') {
    host = host.slice(0, -1);
  }

  const delimeter = url.indexOf('?') === -1 ? '?' : '&';
  const encoded = new Buffer(JSON.stringify(config)).toString('base64');
  const base = skyPagesConfigUtil.getAppBase(skyPagesConfig);
  const resolved = `${host}${base}${url}${delimeter}local=true&_cfg=${encoded}`;

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
