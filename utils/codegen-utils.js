/**
 * Indents a string the specified number of "tabs" (two spaces = one tab).
 * @param {*} count The number of "tabs" to indent.
 * @param {*} s The string to indent.
 */
function indent(count, s) {
  return '  '.repeat(count) + (s || '');
}

module.exports = {
  indent
};
