/*jshint node: true*/
'use strict';

const skyPagesConfigUtil = require('../../config/sky-pages/sky-pages.config');
const config = skyPagesConfigUtil.getSkyPagesConfig();

const getPluginContents = () => {
  let plugins = [];

  if (Array.isArray(config.plugins)) {
    plugins = config.plugins.map(path => require(skyPagesConfigUtil.spaPath(path)));
  }

  return plugins;
};

const processContent = (content, hook) => {
  plugins.forEach(plugin => {
    let processedContent;

    if (typeof plugin[hook] === 'function') {
      processedContent = plugin[hook].call(this, content);
    }

    if (processedContent) {
      content = processedContent;
    }
  });

  return content;
};

const preprocessHtml = (content) => processContent(content, 'preHtml');

const postprocessHtml = (content) => processContent(content, 'postHtml');

const plugins = getPluginContents();

module.exports = {
  preprocessHtml,
  postprocessHtml
};