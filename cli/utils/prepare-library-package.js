/*jshint node: true*/
'use strict';

const fs = require('fs-extra');
const path = require('path');
const logger = require('@blackbaud/skyux-logger');
const skyPagesConfigUtil = require('../../config/sky-pages/sky-pages.config');

function makePackageFileForDist() {
  const contents = fs.readJsonSync(
    skyPagesConfigUtil.spaPath('package.json')
  );
  contents.module = 'index.js';
  contents.main = 'bundles/bundle.umd.js';

  fs.writeJsonSync(
    skyPagesConfigUtil.spaPath('dist', 'package.json'),
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
      fs.copySync(
        skyPagesConfigUtil.spaPath(...pathArr),
        skyPagesConfigUtil.spaPath('dist', ...pathArr)
      );
    } catch (err) {
      logger.warn(`File(s) not found: ${path.join(...pathArr)}`);
    }
  });
}

module.exports = () => {
  makePackageFileForDist();
  copyFilesToDist();
};
