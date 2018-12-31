const merge = require('lodash.mergewith');

function customizer(originalValue, overrideValue) {
  if (Array.isArray(originalValue)) {
    return overrideValue;
  }

  return originalValue;
}

const mergeWith = function (original, override) {
  return merge(original, override, customizer);
};

module.exports = mergeWith;
