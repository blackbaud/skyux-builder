/*jslint node: true */
'use strict';

const path = require('path');
const glob = require('glob');
const fs = require('fs-extra');

function getPath(command, platform, root, dir) {
  let filename;
  switch (command) {
    case 'test':
    case 'watch':
      filename = `config/karma/${command}.karma.conf.js`;
    break;

    case 'e2e':
    case 'visual':
      filename = `config/protractor/protractor.conf.js`;
    break;
  }

  return path.resolve(root, dir, platform, filename);
}

function resolve(command, argv) {

  const platform = argv.platform || '';

  // Using glob so we can find skyux-builder-config regardless of npm install location
  const external = glob.sync(getPath(
    command,
    platform,
    process.cwd(),
    'node_modules/**/skyux-builder-config/**/'
  ));

  const internal = getPath(
    command,
    platform,
    __dirname,
    ''
  );

  let config;
  if (external.length === 1) {
    config = external[0];
  } else if (fs.existsSync(internal)) {
    config = internal;
  }

  return config;
}

module.exports = {
  resolve
};
