/*jslint node: true */
'use strict';

const path = require('path');
const glob = require('glob');
const fs = require('fs-extra');

const skyPagesConfigUtil = require('../../config/sky-pages/sky-pages.config');

function getPath(command, platform, root, dir) {
  let filename;
  switch (command) {
    case 'e2e':
    case 'visual':
      filename = `config/protractor/protractor.conf.js`;
    break;

    // Defaulting to karma so dev-runtime and src-app can be passed in via our test suite.
    default:
      filename = `config/karma/${command}.karma.conf.js`;
    break;
  }

  const resolved = path.resolve(root, dir, platform, filename);
  console.log(resolved);
  return resolved;
}

function resolve(command, argv) {

  const platform = argv.platform || '';

  console.log('LOOKING FOR: ' + command);

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
    skyPagesConfigUtil.outPath(),
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
