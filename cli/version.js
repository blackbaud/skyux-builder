/*jshint node: true*/
'use strict';

const path = require('path');
const logger = require('winston');

/**
 * Returns the version from package.json.
 * @name version
 */
const version = () => {
  const packageJson = require(path.resolve(__dirname, '..', '..', 'package.json'));
  logger.info('sky-pages-out-skyux2: %s', packageJson.version);
};

module.exports = version;
