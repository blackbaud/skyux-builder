/*jshint node: true*/
'use strict';

const path = require('path');
const fs = require('fs-extra');

const logger = require('@blackbaud/skyux-logger');
const spyPagesConfigUtil = require('../../config/sky-pages/sky-pages.config');

function makePackageFileForDist() {
  const contents = fs.readJsonSync(
    spyPagesConfigUtil.spaPath('package.json')
  );
  contents.module = 'index.js';
  contents.main = 'bundles/bundle.umd.js';

  fs.writeJsonSync(
    spyPagesConfigUtil.spaPath('dist', 'package.json'),
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
        spyPagesConfigUtil.spaPath(...pathArr),
        spyPagesConfigUtil.spaPath('dist', ...pathArr)
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
