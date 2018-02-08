/*jshint node: true */
'use strict';

const winston = require('winston');
const minimist = require('minimist');

// Read args in order to disable colors on vsts
const argv = minimist(process.argv.splice(2));
const color = argv.platform !== 'vsts';

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: color,
      showLevel: false
    })
  ]
});

module.exports = logger;
