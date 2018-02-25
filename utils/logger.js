/*jshint node: true */
'use strict';

const winston = require('winston');
const minimist = require('minimist');

// These values are purposefully only read from the command line.
// This is done because the CLI doesn't always have access to a skyuxconfig.json file.
// In the future, this file will be released into it's own package and shared with the CLI.
const argv = minimist(process.argv.slice(2));
const logColor = argv.hasOwnProperty('logColor') ? argv.logColor : true;
const logLevel = argv.hasOwnProperty('logLevel') ? argv.logLevel : 'info';

const logger = new winston.Logger({
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    verbose: 3
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'blue',
    verbose: 'cyan'
  },
  transports: [
    new winston.transports.Console({
      level: logLevel,
      handleExceptions: true,
      colorize: logColor,
      showLevel: false
    })
  ]
});

// Expose this logic to others
logger.logColor = logColor;
logger.logLevel = logLevel;

module.exports = logger;
