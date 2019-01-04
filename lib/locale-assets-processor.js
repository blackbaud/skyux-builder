/* jshint node: true */
'use strict';

const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');

const { spaPath } = require('../config/sky-pages/sky-pages.config');

const localesPath = ['src', 'assets', 'locales'];
const defaultLocaleFileName = 'resources_en_US.json';
const defaultFile = tempPath(defaultLocaleFileName);

const libPaths = [
  spaPath(
    'node_modules',
    '@blackbaud',
    '**',
    ...localesPath
  ),
  spaPath(
    'node_modules',
    '@blackbaud-internal',
    '**',
    ...localesPath
  ),
  spaPath(
    'node_modules',
    '@skyux',
    '**',
    ...localesPath
  )
];

function tempPath(...args) {
  return spaPath('.skypageslocales', ...args);
}

function readJson(file) {
  fs.ensureFileSync(file);

  const buffer = fs.readFileSync(file);

  let contents;
  // Is the locale file empty?
  if (buffer.length === 0) {
    contents = {};
  } else {
    contents = JSON.parse(buffer.toString());
  }

  return contents;
}

function extendJson(...files) {
  return files.reduce((accumulator, file) => {
    return Object.assign(accumulator, readJson(file));
  }, {});
}

function isLocaleFile(file) {
  return /resources_[a-z]+(\-|_)+[A-Z]+\.json$/.test(file);
}

function parseLocaleFileBasename(filePath) {
  return path.basename(filePath).replace(/\-/g, '_');
}

function resolvePhysicalLocaleFilePath(filePath) {
  return tempPath(parseLocaleFileBasename(filePath));
}

function resolveRelativeLocaleFileDestination(filePath) {
  return path.join(
    'assets',
    'locales',
    parseLocaleFileBasename(filePath)
  );
}

function getDefaultLocaleFiles(dirname) {
  return glob.sync(
    path.join(dirname, '@(resources_en_US.json|resources_en-US.json)')
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
  const libFiles = libPaths.reduce((accumulator, libPath) => {
    return accumulator.concat(
      getDefaultLocaleFiles(libPath)
    );
  }, []);
  const contents = extendJson(...libFiles, defaultFile);
  fs.writeJsonSync(defaultFile, contents);
}

function mergeNonDefaultLocaleFiles() {
  // Extend all SPA files with contents of default locale file.
  getNonDefaultLocaleFiles(tempPath())
    .forEach(file => {
      const contents = extendJson(defaultFile, file);
      fs.writeJsonSync(file, contents);
    });

  // Extend all SPA files with library files.
  libPaths.reduce((accumulator, libPath) => {
    return accumulator.concat(
      getNonDefaultLocaleFiles(libPath)
    );
  }, [])
    .forEach(libFile => {
      const basename = path.basename(libFile);
      const spaFile = tempPath(basename);
      const contents = extendJson(defaultFile, spaFile, libFile);
      fs.writeJsonSync(spaFile, contents);
    });
}

function stageLocaleFiles() {
  const temp = tempPath();

  fs.ensureDirSync(temp);
  fs.emptyDirSync(temp);

  // Copy all SPA locale files to the temp directory.
  glob.sync(spaPath(...localesPath, 'resources_*.json'))
    .forEach(filePath => {
      const basename = parseLocaleFileBasename(filePath);
      fs.copySync(filePath, tempPath(basename));
    });
}

function prepareLocaleFiles() {
  stageLocaleFiles();
  mergeDefaultLocaleFiles();
  mergeNonDefaultLocaleFiles();
}

function removeLocaleFiles() {
  fs.removeSync(tempPath());
}

process.on('exit', () => {
  removeLocaleFiles();
});

process.on('SIGINT', () => {
  process.exit();
});

module.exports = {
  getDefaultLocaleFiles,
  isLocaleFile,
  parseLocaleFileBasename,
  prepareLocaleFiles,
  resolvePhysicalLocaleFilePath,
  resolveRelativeLocaleFileDestination
};
