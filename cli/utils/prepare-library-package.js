/*jshint node: true*/
'use strict';

const fs = require('fs-extra');
const path = require('path');
const logger = require('@blackbaud/skyux-logger');
const skyPagesConfigUtil = require('../../config/sky-pages/sky-pages.config');

function makePackageFileForDist() {
  const packageJsonRelativeDir = path.join('src', 'app', 'public', 'package.json');
  const packageJsonAbsolutePath = skyPagesConfigUtil.spaPath(packageJsonRelativeDir);

  if (!fs.existsSync(packageJsonAbsolutePath)) {
    logger.error('SKY UX library failed to compile!');
    logger.error(
      `You must provide a package.json file for your library at: "${packageJsonRelativeDir}".`
    );
    process.exit(1);
    return;
  }

  const contents = fs.readJsonSync(packageJsonAbsolutePath);
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
    const sourcePath = skyPagesConfigUtil.spaPath(...pathArr);
    if (fs.existsSync(sourcePath)) {
      fs.copySync(
        sourcePath,
        skyPagesConfigUtil.spaPath('dist', ...pathArr)
      );
    } else {
      logger.warn(`File(s) not found: ${sourcePath}`);
    }
  });
}

module.exports = () => {
  makePackageFileForDist();
  copyFilesToDist();

  logger.info('SKY UX library bundled successfully!');
};
