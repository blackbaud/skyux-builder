/*jshint node: true*/
'use strict';

const path = require('path');
const logger = require('@blackbaud/skyux-logger');

/**
 * Returns the version from package.json.
 * @name version
 */
function version() {
  const packageJson = require(path.resolve(__dirname, '..', 'package.json'));
  logger.info('@skyux-sdk/builder: %s', packageJson.version);
}

module.exports = version;
