/*jshint node: true*/
'use strict';

module.exports = function (source) {
  return `
${source}

SKYUX_CONFIG = ${JSON.stringify(this.options.SKYUX_CONFIG)};
`;
};
