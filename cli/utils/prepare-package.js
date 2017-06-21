/* jshint node: true */

'use strict';

const fs = require('fs-extra');
const skyPagesConfigUtil = require('../../config/sky-pages/sky-pages.config');

function makePackageFileForDist() {
  const packageJson = fs.readJSONSync(
    skyPagesConfigUtil.spaPath('package.json')
  );
  packageJson.module = 'index.js';
  fs.writeJSONSync(
    skyPagesConfigUtil.spaPath('dist', 'package.json'),
    packageJson,
    { spaces: 2 }
  );
}

function copyFilesToDist() {
  fs.copySync(
    skyPagesConfigUtil.spaPath('README.md'),
    skyPagesConfigUtil.spaPath('dist', 'README.md')
  );

  fs.copySync(
    skyPagesConfigUtil.spaPath('CHANGELOG.md'),
    skyPagesConfigUtil.spaPath('dist', 'CHANGELOG.md')
  );
}

module.exports = () => {
  makePackageFileForDist();
  copyFilesToDist();
};
