/*jshint node: true*/
'use strict';

const fs = require('fs-extra');
const path = require('path');
const logger = require('@blackbaud/skyux-logger');
const { spaPath } = require('../../config/sky-pages/sky-pages.config');

function makePackageFileForDist() {
  const packageJson = fs.readJSONSync(
    spaPath('package.json')
  );
  packageJson.module = 'index.js';
  packageJson.main = 'bundles/bundle.umd.js';
  fs.writeJSONSync(
    spaPath('dist', 'package.json'),
    packageJson,
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
      fs.copySync(
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
