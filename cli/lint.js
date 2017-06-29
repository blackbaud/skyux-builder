/*jslint node: true */
'use strict';

const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');

function test(command, argv) {
  const spawn = require('cross-spawn');

  const flags = [
    '--max-old-space-size=4096',
    './node_modules/.bin/tslint',
    '--type-check',
    '--project',
    skyPagesConfigUtil.spaPath('tsconfig.json'),
    '--config',
    skyPagesConfigUtil.spaPath('tslint.json'),
    '--exclude',
    '**/node_modules/**/*.ts'
  ];

  const options = {
    stdio: 'inherit'
  };

  // Pass our exitCode up
  const test = spawn('node', flags, options);
  test.on('exit', exitCode => {
    console.log('exitCode', exitCode);
    process.exit(exitCode);
  });
}

module.exports = test;
