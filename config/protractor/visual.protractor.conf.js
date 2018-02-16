/*jshint node: true */
'use strict';

const config = require('./protractor.conf.js');

config.capabilities = {
  'browserName': 'chrome',
  'chromeOptions': {
    'args': [
      '--disable-extensions',
      '--ignore-certificate-errors'
    ]
  }
};

config.specs = [
  path.join(process.cwd(), '**', '*.visual-spec.ts')
];

config.directConnect = true;

exports.config = config;
