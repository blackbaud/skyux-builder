/*jshint node: true*/
'use strict';

const logger = require('winston');
let plugins;

const getPluginContents = (skyPagesConfig) => {
  let contents = [];

  if (skyPagesConfig && skyPagesConfig.plugins && skyPagesConfig.plugins.length) {
    skyPagesConfig.plugins.forEach(path => {
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

function preload(content, loaderConfig) {
  plugins = getPluginContents(loaderConfig.options.SKY_PAGES);
  return processContent.apply({}, [content, 'preload', loaderConfig.resourcePath]);
}

function postload(content, loaderConfig) {
  plugins = getPluginContents(loaderConfig.options.SKY_PAGES);
  return processContent.apply({}, [content, 'postload', loaderConfig.resourcePath]);
}

module.exports = {
  preload,
  postload
};
