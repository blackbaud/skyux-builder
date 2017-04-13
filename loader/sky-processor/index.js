/*jshint node: true*/
'use strict';

const logger = require('winston');
let plugins;

const getPluginContents = (skyAppConfig) => {
  let contents = [];

  if (skyAppConfig &&
    skyAppConfig.skyux &&
    skyAppConfig.skyux.plugins &&
    skyAppConfig.skyux.plugins.length
  ) {
    skyAppConfig.skyux.plugins.forEach(path => {
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
  plugins = getPluginContents(loaderConfig.options.skyAppConfig);
  return processContent(content, 'preload', loaderConfig.resourcePath);
}

function postload(content, loaderConfig) {
  plugins = getPluginContents(loaderConfig.options.skyAppConfig);
  return processContent(content, 'postload', loaderConfig.resourcePath);
}

module.exports = {
  preload,
  postload
};
