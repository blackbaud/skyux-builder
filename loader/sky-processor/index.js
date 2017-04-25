/*jshint node: true*/
'use strict';

const logger = require('winston');
let plugins;

const getPluginContents = (skyPagesConfig) => {
  let contents = [];

  if (skyPagesConfig &&
    skyPagesConfig.skyux &&
    skyPagesConfig.skyux.plugins &&
    skyPagesConfig.skyux.plugins.length
  ) {
    skyPagesConfig.skyux.plugins.forEach(path => {
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
  plugins.forEach(plugin => {
    let callback = plugin[callbackName];
    if (typeof callback === 'function') {
      content = callback.call({}, content, ...additionalArgs) || content;
    }
  });

  return content;
};

function preload(content, loaderConfig) {
  plugins = getPluginContents(loaderConfig.options.skyPagesConfig);
  return processContent(content, 'preload', loaderConfig.resourcePath);
}

function postload(content, loaderConfig) {
  plugins = getPluginContents(loaderConfig.options.skyPagesConfig);
  return processContent(content, 'postload', loaderConfig.resourcePath);
}

module.exports = {
  preload,
  postload
};
