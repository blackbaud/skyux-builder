/*jshint node: true*/
'use strict';

const skyPagesConfigUtil = require('../../config/sky-pages/sky-pages.config');
const config = skyPagesConfigUtil.getSkyPagesConfig();

const getPluginContents = () => {
  let contents = [];

  if (Array.isArray(config.plugins)) {
    contents = config.plugins.map(path => require(path));
  }

  return contents;
};

const processContent = (content, resourcePath, hook) => {
  let args = [content, resourcePath];

  plugins.forEach(plugin => {
    let processedContent;

    if (typeof plugin[hook] === 'function') {
      processedContent = plugin[hook].apply({}, args);
    }

    if (processedContent) {
      content = processedContent;
    }
  });

  return content;
};

function preload(content) {
  return processContent(content, this.resourcePath, 'preload');
}

function postload(content) {
  return processContent(content, this.resourcePath, 'postload');
}

const plugins = getPluginContents();

module.exports = {
  preload,
  postload
};