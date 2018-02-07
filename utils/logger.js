/*jshint node: true */
'use strict';

const winston = require('winston');

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
      showLevel: false
    })
  ]
});

module.exports = logger;
