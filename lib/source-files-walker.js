/*jshint node: true */
'use strict';

const fs = require('fs-extra');
const glob = require('glob');

const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');
const processor = require('../loader/sky-processor');

const walkSourceFiles = (skyPagesConfig) => {
  const filePaths = glob.sync(skyPagesConfigUtil.spaPathTempSrc('app', '**', '*.*'));

  filePaths.forEach(filePath => {
    const contents = fs.readFileSync(filePath);
    const altered = processor.preload(contents, {
      resourcePath: filePath,
      options: {
        skyPagesConfig
      }
    });

    if (contents !== altered) {
      fs.writeFileSync(filePath, altered, { encoding: 'utf8' });
    }
  });
};

module.exports = walkSourceFiles;
