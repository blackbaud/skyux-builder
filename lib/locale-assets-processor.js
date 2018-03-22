/*jshint node: true*/
'use strict';

const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');
const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');

const localesPath = ['src', 'assets', 'locales'];
const defaultLocaleFileName = 'resources_en_US.json';
const defaultFile = skyPagesConfigUtil.spaPathTemp(...localesPath, defaultLocaleFileName);
const libLocalesPath = skyPagesConfigUtil.spaPath(
  'node_modules',
  '@blackbaud',
  '**',
  ...localesPath
);
const internalLibLocalesPath = skyPagesConfigUtil.spaPath(
  'node_modules',
  '@blackbaud-internal',
  '**',
  ...localesPath
);

function readJson(file) {
  let contents;

  fs.ensureFileSync(file);

  try {
    contents = fs.readJsonSync(file);
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

function writeJson(file, contents) {
  fs.writeJsonSync(
    file,
    contents,
    { spaces: 2 }
  );
}

function getNonDefaultLibraryFiles() {
  const options = {
    ignore: `**/${defaultLocaleFileName}`
  };

  return glob.sync(
    path.join(libLocalesPath, 'resources_*.json'),
    options
  ).concat(glob.sync(
    path.join(internalLibLocalesPath, 'resources_*.json'),
    options
  ));
}

function mergeDefaultLocaleFiles() {
  const libFiles = glob.sync(
    path.join(libLocalesPath, defaultLocaleFileName)
  ).concat(glob.sync(
    path.join(internalLibLocalesPath, defaultLocaleFileName)
  ));

  const contents = extendJson(defaultFile, ...libFiles);
  writeJson(defaultFile, contents);
}

function mergeNonDefaultLocaleFiles() {
  const spaFiles = glob.sync(
    skyPagesConfigUtil.spaPathTemp(
      ...localesPath,
      'resources_*.json'
    ),
    { ignore: `**/${defaultLocaleFileName}` }
  );

  // Extend all SPA files with contents of default locale file.
  spaFiles.forEach(file => {
    const contents = extendJson(defaultFile, file);
    writeJson(file, contents);
  });

  // Extend all SPA files with library files.
  const libFiles = getNonDefaultLibraryFiles();
  libFiles.forEach(file => {
    const basename = path.basename(file);
    const spaFile = skyPagesConfigUtil.spaPathTemp(...localesPath, basename);
    const contents = extendJson(defaultFile, file, spaFile);
    writeJson(spaFile, contents);
  });
}

function prepareLocaleFiles() {
  mergeDefaultLocaleFiles();
  mergeNonDefaultLocaleFiles();
}

module.exports = {
  prepareLocaleFiles
};
