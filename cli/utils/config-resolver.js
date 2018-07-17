/*jslint node: true */
'use strict';

const path = require('path');
const glob = require('glob');
const fs = require('fs-extra');
const logger = require('@blackbaud/skyux-logger');

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

  return path.join(root, dir, platform, filename);
}

function resolve(command, argv) {

  const platform = argv.platform || '';
  const internal = getPath(
    command,
    platform,
    skyPagesConfigUtil.outPath(),
    ''
  );

  // Using glob so we can find skyux-builder-config regardless of npm install location
  let external = glob.sync(getPath(
    command,
    platform,
    process.cwd(),
    'node_modules/**/skyux-builder-config/'
  ));

  let config;
  if (external.length > 1) {
    logger.warn(`Found multiple external config files.`);
    external = external.slice(0, 1);
  }

  if (external.length === 1) {
    logger.info(`Using external config ${external[0]}`);
    config = external[0];
  } else if (fs.existsSync(internal)) {
    logger.info(`Using internal config ${internal}`);
    config = internal;
  } else {
    logger.error('Error locating a config file.');
    process.exit(1);
  }

  return config;
}

module.exports = {
  resolve
};
