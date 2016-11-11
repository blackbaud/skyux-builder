/*jshint node: true*/
'use strict';

const generator = require('../../lib/sky-pages-module-generator');

module.exports = function () {
  return generator.getSource(this.options.SKY_PAGES);
};
