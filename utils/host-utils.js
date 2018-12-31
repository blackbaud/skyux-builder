// HTML Webpack Plugin has already solved sorting the entries
const sorter = require('html-webpack-plugin/lib/chunksorter');
const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');

/**
 * Sorts chunks into array of scripts.
 * @param {Array} chunks
 */
function getScripts(chunks) {
  const scripts = [];

  // Used when skipping the build, short-circuit to return metadata
  if (chunks.metadata) {
    return chunks.metadata;
  }

  sorter.dependency(chunks, undefined, {}).forEach((chunk) => {
    scripts.push({
      name: chunk.files[0]
    });
  });

  // Webpack reversed the order of these scripts
  scripts.reverse();

  return scripts;
}

/**
 * Creates a resolved host url.
 * @param {string} url
 * @param {string} localUrl
 * @param {Array} chunks
 * @param {Object} skyPagesConfig
 */
function resolve(url, localUrl, chunks, skyPagesConfig) {
  let host = skyPagesConfig.skyux.host.url;
  const config = {
    scripts: getScripts(chunks),
    localUrl
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
  const encoded = Buffer.from(JSON.stringify(config).toString('base64'));
  const base = skyPagesConfigUtil.getAppBase(skyPagesConfig);
  const resolved = `${host}${base}${url}${delimeter}local=true&_cfg=${encoded}`;

  return resolved;
}

module.exports = {
  resolve,
  getScripts
};
