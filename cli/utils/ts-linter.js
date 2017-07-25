/*jslint node: true */
'use strict';

const spawn = require('cross-spawn');
const skyPagesConfigUtil = require('../../config/sky-pages/sky-pages.config');
const logger = require('../../utils/logger');

const flags = [
  '--max-old-space-size=4096',
  '--type-check',
  '--project',
  skyPagesConfigUtil.spaPath('tsconfig.json'),
  '--config',
  skyPagesConfigUtil.spaPath('tslint.json')
];

function lintSync() {
  logger.info('Starting TSLint...');

  const spawnResult = spawn.sync('./node_modules/.bin/tslint', flags);
  const errorString = spawnResult.stderr.toString().trim();

  let errors = [];
  if (errorString) {
    errors = errorString.split(/\r?\n/);
  }

  // Print linting results to console.
  errors.forEach(error => logger.error(error));
  const plural = (errors.length === 1) ? '' : 's';
  logger.info(`TSLint finished with ${errors.length} error${plural}.`);

  return spawnResult.status;
}

module.exports = {
  lintSync
};
