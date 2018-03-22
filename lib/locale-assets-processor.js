/* jshint node: true */
'use strict';

const glob = require('glob');
const path = require('path');

const {
  ensureFileSync,
  readJsonSync,
  writeJsonSync
} = require('fs-extra');

const {
  spaPath,
  spaPathTemp
} = require('../config/sky-pages/sky-pages.config');

const localesPath = ['src', 'assets', 'locales'];
const defaultLocaleFileName = 'resources_en_US.json';

const defaultFile = spaPathTemp(
  ...localesPath,
  defaultLocaleFileName
);

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
    .concat(
      getDefaultLocaleFiles(libInternalPath)
    );

  const contents = extendJson(defaultFile, ...libFiles);
  writeJsonSync(defaultFile, contents);
}

function mergeNonDefaultLocaleFiles() {
  // Extend all SPA files with contents of default locale file.
  const spaFiles = getNonDefaultLocaleFiles(
    spaPathTemp(...localesPath)
  );

  spaFiles.forEach(file => {
    const contents = extendJson(defaultFile, file);
    writeJsonSync(file, contents);
  });

  // Extend all SPA files with library files.
  const libFiles = getNonDefaultLocaleFiles(libPath)
    .concat(
      getNonDefaultLocaleFiles(libInternalPath)
    );

  libFiles.forEach(file => {
    const basename = path.basename(file);
    const spaFile = spaPathTemp(...localesPath, basename);
    const contents = extendJson(defaultFile, file, spaFile);
    writeJsonSync(spaFile, contents);
  });
}

function prepareLocaleFiles() {
  mergeDefaultLocaleFiles();
  mergeNonDefaultLocaleFiles();
}

module.exports = {
  prepareLocaleFiles
};
