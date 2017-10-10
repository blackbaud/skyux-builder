/*jshint node: true*/
'use strict';

const merge = require('lodash.mergeWith');

function customizer(originalValue, overrideValue) {
  if (Array.isArray(originalValue)) {
    return overrideValue;
  }
}

const mergeWith = function (original, override) {
  return merge(original, override, customizer);
};

module.exports = mergeWith;
