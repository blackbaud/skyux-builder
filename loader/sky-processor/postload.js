const processor = require('./index');

module.exports = function (content) {
  return processor.postload.call(this, content, this);
};
