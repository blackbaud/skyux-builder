/*jslint node: true */
'use strict';

const processor = require('./index');

module.exports = function (content) {
  let _this = this;
  return processor.preload(content, _this.resourcePath);
};
