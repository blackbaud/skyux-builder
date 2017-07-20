/*jslint node: true */
'use strict';

const spawn = require('cross-spawn');
const logger = require('winston');
const skyPagesConfigUtil = require('../../config/sky-pages/sky-pages.config');

const flags = [
  '--max-old-space-size=4096',
  '--type-check',
  '--project',
  skyPagesConfigUtil.spaPath('tsconfig.json'),
  '--config',
  skyPagesConfigUtil.spaPath('tslint.json'),
  '--exclude',
  '**/node_modules/**/*.ts'
];

function lintSync() {
  logger.info('Starting TSLint...');

  const spawnOptions = { stdio: 'inherit' };
  const result = spawn.sync('./node_modules/.bin/tslint', flags, spawnOptions);

  if (result.status > 0) {
    logger.error(`TSLint failed due to linting errors. (status code ${result.status})`);
  }

  logger.info('TSLint complete.');
  return result.status;
}

module.exports = {
  lintSync
};
