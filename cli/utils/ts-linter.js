/*jslint node: true */
'use strict';

const spawn = require('cross-spawn');
const skyPagesConfigUtil = require('../../config/sky-pages/sky-pages.config');
const Winston = require('winston');

const logger = new Winston.Logger({
  transports: [
    new Winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true
    })
  ]
});

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

  const result = spawn.sync('./node_modules/.bin/tslint', flags);

  if (result.status > 0) {
    logger.error(result.stderr.toString());
    logger.error(`TSLint failed due to linting errors. (status code ${result.status})`);
  } else {
    logger.info('TSLint completed with zero (0) errors.');
  }

  return result.status;
}

module.exports = {
  lintSync
};
