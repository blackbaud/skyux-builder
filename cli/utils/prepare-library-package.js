/*jshint node: true*/
'use strict';

const path = require('path');
const fs = require('fs-extra');

const { warn } = require('@blackbaud/skyux-logger');
const { spaPath } = require('../../config/sky-pages/sky-pages.config');

function makePackageFileForDist() {
  const contents = fs.readJsonSync(spaPath('package.json'));
  contents.module = 'index.js';
  contents.main = 'bundles/bundle.umd.js';

  fs.writeJsonSync(
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
      fs.copySync(
        spaPath(...pathArr),
        spaPath('dist', ...pathArr)
      );
    } catch (err) {
      warn(`File not found: ${path.join(...pathArr)}`);
    }
  });
}

module.exports = () => {
  makePackageFileForDist();
  copyFilesToDist();
};
