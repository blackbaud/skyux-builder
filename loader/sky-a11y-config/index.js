/*jshint node: true*/
'use strict';

module.exports = function (content) {
  const axeConfig = require('../../config/axe/axe.config');

  content += `\n;window.SKY_APP_A11Y_CONFIG = ${JSON.stringify(axeConfig.getConfig())};\n`;

  return content;
};
