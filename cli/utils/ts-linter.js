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
  let lintResult = {};

  if (spawnResult.status > 0) {
    lintResult.errors = spawnResult.stderr.toString().trim().split(/\r?\n/);
  }

  const plural = (lintResult.errors.length === 1) ? '' : 's';
  lintResult.message = `TSLint finished with (${lintResult.errors.length}) linting error${plural}.`;
  lintResult.exitCode = spawnResult.status;

  return lintResult;
}

module.exports = {
  lintSync
};
