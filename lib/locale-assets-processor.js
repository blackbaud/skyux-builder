/* jshint node: true */
'use strict';

const glob = require('glob');
const path = require('path');

const {
  copySync,
  emptyDirSync,
  ensureDirSync,
  ensureFileSync,
  readJsonSync,
  writeJsonSync
} = require('fs-extra');

const { spaPath } = require('../config/sky-pages/sky-pages.config');

const localesPath = ['src', 'assets', 'locales'];
const defaultLocaleFileName = 'resources_en_US.json';
const defaultFile = tempPath(defaultLocaleFileName);

const libPath = spaPath(
  'node_modules',
  '@blackbaud',
  '**',
  ...localesPath
);

const libInternalPath = spaPath(
  'node_modules',
  '@blackbaud-internal',
  '**',
  ...localesPath
);

function tempPath(...args) {
  return spaPath('.skypageslocales', ...args);
}

function readJson(file) {
  let contents;

  ensureFileSync(file);

  try {
    contents = readJsonSync(file);
  } catch (err) {
    contents = {};
  }

  return contents;
}

function extendJson(...files) {
  return files.reduce((accumulator, file) =>
    Object.assign(accumulator, readJson(file)),
    {}
  );
}

function getDefaultLocaleFiles(dirname) {
  return glob.sync(
    path.join(dirname, defaultLocaleFileName)
  );
}

function getNonDefaultLocaleFiles(dirname) {
  return glob.sync(
    path.join(dirname, 'resources_*.json'),
    {
      ignore: `**/${defaultLocaleFileName}`
    }
  );
}

function mergeDefaultLocaleFiles() {
  const libFiles = getDefaultLocaleFiles(libPath)
    .concat(getDefaultLocaleFiles(libInternalPath));

  const contents = extendJson(defaultFile, ...libFiles);
  writeJsonSync(defaultFile, contents);
}

function mergeNonDefaultLocaleFiles() {
  // Extend all SPA files with contents of default locale file.
  const spaFiles = getNonDefaultLocaleFiles(tempPath());

  spaFiles.forEach(file => {
    const contents = extendJson(defaultFile, file);
    writeJsonSync(file, contents);
  });

  // Extend all SPA files with library files.
  const libFiles = getNonDefaultLocaleFiles(libPath)
    .concat(getNonDefaultLocaleFiles(libInternalPath));

  libFiles.forEach(file => {
    const basename = path.basename(file);
    const spaFile = tempPath(basename);
    const contents = extendJson(defaultFile, file, spaFile);
    writeJsonSync(spaFile, contents);
  });
}

function stageLocaleFiles() {
  const files = glob.sync(
    spaPath(...localesPath, 'resources_*.json')
  );

  const temp = tempPath();
  ensureDirSync(temp);
  emptyDirSync(temp);

  files.forEach((file) => {
    const basename = path.basename(file);
    copySync(file, tempPath(basename));
  });
}

function prepareLocaleFiles() {
  stageLocaleFiles();
  mergeDefaultLocaleFiles();
  mergeNonDefaultLocaleFiles();
}

module.exports = {
  prepareLocaleFiles
};
