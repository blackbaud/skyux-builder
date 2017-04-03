const skyPagesConfigUtil = require('../../config/sky-pages/sky-pages.config');
const config = skyPagesConfigUtil.getSkyPagesConfig();

const getPluginContents = () => {
  let plugins = [];

  if (Array.isArray(config.plugins)) {
    plugins = config.plugins.map(path => {
      return require(skyPagesConfigUtil.spaPath(path));
    })
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

const preprocessHtml = (content) => {
  return processContent(content, 'htmlPre');
};

const postprocessHtml = (content) => {
  return processContent(content, 'htmlPost');
};

const plugins = getPluginContents();

module.exports = {
  preprocessHtml,
  postprocessHtml
};