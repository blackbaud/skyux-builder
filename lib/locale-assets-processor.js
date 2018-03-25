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
  removeSync,
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
  ensureFileSync(file);

  let contents;
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

function isLocaleFile(file) {
  return /resources_[a-z]+_[A-Z]+\.json$/.test(file);
}

function resolvePhysicalLocaleFilePath(filePath) {
  return tempPath(path.basename(filePath));
}

function resolveRelativeLocaleFileDestination(filePath) {
  return path.join(
    'assets',
    'locales',
    path.basename(filePath)
  )
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
  const libFiles = getDefaultLocaleFiles(libPath);
  const libInternalFiles = getDefaultLocaleFiles(libInternalPath);
  const contents = extendJson(defaultFile, ...libFiles, ...libInternalFiles);
  writeJsonSync(defaultFile, contents);
}

function mergeNonDefaultLocaleFiles() {
  // Extend all SPA files with contents of default locale file.
  getNonDefaultLocaleFiles(tempPath())
    .forEach(file => {
      const contents = extendJson(defaultFile, file);
      writeJsonSync(file, contents);
    });

  // Extend all SPA files with library files.
  getNonDefaultLocaleFiles(libPath)
    .concat(getNonDefaultLocaleFiles(libInternalPath))
    .forEach(file => {
      const basename = path.basename(file);
      const spaFile = tempPath(basename);
      const contents = extendJson(defaultFile, file, spaFile);
      writeJsonSync(spaFile, contents);
    });
}

function stageLocaleFiles() {
  const temp = tempPath();

  ensureDirSync(temp);
  emptyDirSync(temp);

  // Copy all SPA locale files to the demp directory.
  glob.sync(spaPath(...localesPath, 'resources_*.json'))
    .forEach(file => {
      const basename = path.basename(file);
      copySync(file, tempPath(basename));
    });
}

function prepareLocaleFiles() {
  stageLocaleFiles();
  mergeDefaultLocaleFiles();
  mergeNonDefaultLocaleFiles();
}

function removeLocaleFiles() {
  removeSync(tempPath());
}

process.on('exit', () => {
  removeLocaleFiles();
});

process.on('SIGINT', () => {
  process.exit();
});

module.exports = {
  isLocaleFile,
  prepareLocaleFiles,
  removeLocaleFiles,
  resolvePhysicalLocaleFilePath,
  resolveRelativeLocaleFileDestination
};
