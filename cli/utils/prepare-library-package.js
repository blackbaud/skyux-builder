/*jshint node: true*/
'use strict';

const fs = require('fs-extra');
const skyPagesConfigUtil = require('../../config/sky-pages/sky-pages.config');

function makePackageFileForDist() {
  const packageJson = fs.readJSONSync(
    skyPagesConfigUtil.spaPath('package.json')
  );
  packageJson.module = 'index.js';
  packageJson.main = 'bundles/bundle.umd.js';
  fs.writeJSONSync(
    skyPagesConfigUtil.spaPath('dist', 'package.json'),
    packageJson,
    { spaces: 2 }
  );
}

function copyFilesToDist() {
  try {
    fs.copySync(
      skyPagesConfigUtil.spaPath('README.md'),
      skyPagesConfigUtil.spaPath('dist', 'README.md')
    );

    fs.copySync(
      skyPagesConfigUtil.spaPath('CHANGELOG.md'),
      skyPagesConfigUtil.spaPath('dist', 'CHANGELOG.md')
    );

    fs.copySync(
      skyPagesConfigUtil.spaPath('src', 'assets'),
      skyPagesConfigUtil.spaPath('dist', 'src', 'assets')
    );
  } catch (err) {}
}

module.exports = () => {
  makePackageFileForDist();
  copyFilesToDist();
};
