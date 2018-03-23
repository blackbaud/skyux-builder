/*jshint node: true*/
'use strict';

const path = require('path');
const logger = require('@blackbaud/skyux-logger');

const {
  copySync,
  readJsonSync,
  writeJsonSync
} = require('fs-extra');

const {
  spaPath
} = require('../../config/sky-pages/sky-pages.config');

function makePackageFileForDist() {
  const contents = readJsonSync(spaPath('package.json'));
  contents.module = 'index.js';
  contents.main = 'bundles/bundle.umd.js';

  writeJsonSync(
    spaPath('dist', 'package.json'),
    contents,
    { spaces: 2 }
  );
}

function copyFilesToDist() {
  const pathsToCopy = [
    ['README.md'],
    ['CHANGELOG.md'],
    ['src', 'assets']
  ];

  pathsToCopy.forEach(pathArr => {
    try {
      copySync(
        spaPath(...pathArr),
        spaPath('dist', ...pathArr)
      );
    } catch (err) {
      logger.warn(`File not found: ${path.join(...pathArr)}`);
    }
  });
}

module.exports = () => {
  makePackageFileForDist();
  copyFilesToDist();
};
