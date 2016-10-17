/*jslint node: true */
'use strict';

const path = require('path');
const spawn = require('cross-spawn');

/**
 * Returns the path to the correct karma config, based on the command.
 * @name getKarmaConfigPath
 * @param {Object} argv
 * @returns {String} karmaConfigPath
 */
function getKarmaConfigPath(argv) {
  return path.resolve(
    __dirname,
    '..',
    'config/karma/' + argv._[0] + '.karma.conf.js'
  );
}

/**
 * Spawns the karam start command.
 * @name test
 */
function test(argv) {

  const flags = [
    '--max-old-space-size=4096',
    'node_modules/karma/bin/karma',
    'start',
    getKarmaConfigPath(argv)
  ];

  const options = {
    stdio: 'inherit'
  };

  spawn('node', flags, options);
}

module.exports = test;
