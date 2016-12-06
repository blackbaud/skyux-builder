/*jshint node: true*/
'use strict';

/**
 * Converts the file path to an aliased path that can be pulled in by Webpack
 * @name importPath
 * @param {Array} path The path to convert.
 * @returns {string} The converted path.
 */
function importPath(path, spaPathAlias) {
  // Prepend the alias and remove the file extension since the file extension causes
  // a TypeScript error.
  return spaPathAlias + '/' + path.replace(/\.[^\.]+$/, '');
}

/**
 * Adds indentation to beginning of string.
 * @name
 * @param {Number} count
 * @returns {String} indentation
 */
function indent(count) {
  let indentation = '';

  for (let i = 0; i < count; i++) {
    indentation += '  ';
  }

  return indentation;
}

/**
 * Combines N number of arrays of component names, joins them, and returns them as a string.
 * @name join
 * @param {Array} items - Array of items to join
 * @param {string} [sep=\n] - Separator
 * @returns {string} componentName
 */
function joinAsString() {
  const args = Array.prototype.concat.apply([], arguments);
  return `[
    ${args.join(',\n' + indent(2))}
  ]`;
}

// Public API
module.exports = {
  importPath: importPath,
  indent: indent,
  joinAsString: joinAsString
};
