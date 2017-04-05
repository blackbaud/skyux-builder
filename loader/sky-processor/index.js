/*jshint node: true*/
'use strict';

const logger = require('winston');
const skyPagesConfigUtil = require('../../config/sky-pages/sky-pages.config');
const config = skyPagesConfigUtil.getSkyPagesConfig();

const getPluginContents = () => {
  let contents = [];

  if (config.plugins && config.plugins.length) {
    config.plugins.forEach(path => {
      try {
        contents.push(require(path));
      } catch (error) {
        logger.info(`Plugin not found: ${path}`);
      }
    });
  }

  return contents;
};

const processContent = (content, callbackName, ...additionalArgs) => {
  let args = [content].concat(additionalArgs);

  plugins.forEach(plugin => {
    let callback = plugin[callbackName];
    if (typeof callback === 'function') {
      content = callback.apply({}, args) || content;
    }
  });

  return content;
};

function preload(content, ...args) {
  return processContent.apply({}, [content, 'preload'].concat(args));
}

function postload(content, ...args) {
  return processContent.apply({}, [content, 'postload'].concat(args));
}

const plugins = getPluginContents();

module.exports = {
  preload,
  postload
};
