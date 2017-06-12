/*jshint node: true */
'use strict';

const fs = require('fs-extra');
const path = require('path');
const logger = require('winston');

const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');
const processor = require('../loader/sky-processor');

const getFileList = (dir, fileList = []) => {
  let files;

  try {
    files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const isDirectory = (fs.statSync(filePath).isDirectory());

      if (isDirectory) {
        fileList = getFileList(filePath, fileList);
        return;
      }

      fileList.push(filePath);
    });
  } catch (error) {
    logger.info(error.message);
  }

  return fileList;
};

const getFileContents = (fileList = []) => {
  let fileContents = [];
  fileList.forEach(filePath => {
    let contents = fs.readFileSync(filePath, { encoding: 'utf8' });
    fileContents.push({
      path: filePath,
      contents: contents
    });
  });
  return fileContents;
};

const walkSourceFiles = (skyPagesConfig) => {
  let fileList = getFileList(skyPagesConfigUtil.spaPathTempSrc('app'));
  let files = getFileContents(fileList);

  processor.init(skyPagesConfig);

  files.forEach(file => {
    const changes = processor.processContent(
      file.contents,
      'preload',
      file.path,
      skyPagesConfig
    );

    if (file.contents !== changes) {
      fs.writeFileSync(file.path, changes, { encoding: 'utf8' });
    }
  });
};

module.exports = walkSourceFiles;
