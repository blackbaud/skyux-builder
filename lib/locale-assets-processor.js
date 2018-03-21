/*jshint node: true*/
'use strict';

const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');
const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');

const localesPath = ['src', 'assets', 'locales'];
const defaultLocaleFileName = 'resources_en_US.json';
const defaultFile = skyPagesConfigUtil.spaPathTemp(...localesPath, defaultLocaleFileName);

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

  const files = glob.sync(skyPagesConfigUtil.spaPath(
    'node_modules', '@blackbaud', '**', ...localesPath, 'resources_*.json'
  ), options);

  return files.concat(glob.sync(skyPagesConfigUtil.spaPath(
    'node_modules', '@blackbaud-internal', '**', ...localesPath, 'resources_*.json'
  ), options));
}

function mergeDefaultLocaleFiles() {
  const libFiles = glob.sync(skyPagesConfigUtil.spaPath(
    'node_modules', '@blackbaud', '**', ...localesPath, defaultLocaleFileName
  )).concat(glob.sync(skyPagesConfigUtil.spaPath(
    'node_modules', '@blackbaud-internal', '**', ...localesPath, defaultLocaleFileName
  )));

  const contents = extendJson(defaultFile, ...libFiles);
  writeJson(defaultFile, contents);
}

function extendNonDefaultLocaleFiles() {
  const spaFiles = glob.sync(skyPagesConfigUtil.spaPathTemp(
    ...localesPath, 'resources_*.json'
  ), { ignore: `**/${defaultLocaleFileName}` });

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
  extendNonDefaultLocaleFiles();
}

module.exports = {
  prepareLocaleFiles
};
