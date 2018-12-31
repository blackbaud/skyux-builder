const processor = require('./index');

module.exports = function (content) {
  return processor.preload.call(this, content, this);
};
