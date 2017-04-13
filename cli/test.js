/*jslint node: true */
'use strict';

/**
 * Spawns the karam start command.
 * @name test
 */
function test(command) {

  const path = require('path');
  const spawn = require('cross-spawn');

  const karmaConfigPath = path.resolve(
    __dirname,
    '..',
    'config/karma/' + command + '.karma.conf.js'
  );

  const flags = [
    '--max-old-space-size=4096',
    'node_modules/karma/bin/karma',
    'start',
    karmaConfigPath,
    '--command',
    command
  ];

  const options = {
    stdio: 'inherit'
  };

  // Pass our exitCode up
  const test = spawn('node', flags, options);
  test.on('exit', exitCode => process.exit(exitCode));
}

module.exports = test;
