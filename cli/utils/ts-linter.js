/*jslint node: true */
'use strict';

const spawn = require('cross-spawn');
const logger = require('@blackbaud/skyux-logger');
const skyPagesConfigUtil = require('../../config/sky-pages/sky-pages.config');

const flags = [
  '--project',
  skyPagesConfigUtil.spaPath('tsconfig.json'),
  '--config',
  skyPagesConfigUtil.spaPath('tslint.json'),
  '--exclude',
  '**/node_modules/**/*.ts'
];

function lintSync() {
  logger.info('Starting TSLint...');

  const spawnResult = spawn.sync('./node_modules/.bin/tslint', flags);

  // Convert buffers to strings.
  let output = [];
  spawnResult.output.forEach((buffer) => {
    if (buffer === null) {
      return;
    }

    const str = buffer.toString().trim();
    if (str) {
      output.push(str);
    }
  });

  // Convert multi-line errors into single errors.
  let errors = [];
  output.forEach((str) => {
    errors = errors.concat(str.split(/\r?\n/));
  });

  // Print linting results to console.
  errors.forEach(error => logger.error(error));
  const plural = (errors.length === 1) ? '' : 's';
  logger.info(`TSLint finished with ${errors.length} error${plural}.`);

  return {
    exitCode: spawnResult.status,
    errors: errors
  };
}

module.exports = {
  lintSync
};
