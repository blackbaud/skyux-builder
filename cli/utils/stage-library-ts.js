/*jshint node: true*/
'use strict';

const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');
const sass = require('node-sass');
const tildeImporter = require('node-sass-tilde-importer');

const skyPagesConfigUtil = require('../../config/sky-pages/sky-pages.config');
const spaPathTempSrc = skyPagesConfigUtil.spaPathTemp();

function copySource() {
  fs.copySync(
    skyPagesConfigUtil.spaPath('src', 'app', 'public'),
    skyPagesConfigUtil.spaPathTemp()
  );
}

function deleteNonDistFiles() {
  let files = glob.sync(`${spaPathTempSrc}/**/*.spec.ts`);
  files.forEach(file => fs.removeSync(file));
}

function inlineHtmlCss() {
  const templateUrlRegEx = /templateUrl\:\s*'(.+?\.html)'/gi;
  const styleUrlsRegEx = /styleUrls\:\s*\[\s*'(.+?\.scss)'\s*]/gi;

  let files = glob.sync(`${spaPathTempSrc}/**/*.ts`);

  files.forEach((file) => {
    let fileContents = fs.readFileSync(file, { encoding: 'utf8' });
    let dirname = path.dirname(file);
    let matches;

    // templateUrl
    matches = templateUrlRegEx.exec(fileContents);
    while (matches) {
      let requireFile = path.join(dirname, matches[1]);
      let requireContents = getFileContents(requireFile);
      requireContents = `template: ${requireContents}`;
      fileContents = fileContents.replace(matches[0], requireContents);
      matches = templateUrlRegEx.exec(fileContents);

      // Since we're changing the file contents in each iteration and since the regex is stateful
      // we need to reset the regex; otherwise it might not be able to locate subsequent matches
      // after the first replacement.
      templateUrlRegEx.lastIndex = 0;
    }

    // styleUrls
    matches = styleUrlsRegEx.exec(fileContents);
    while (matches) {
      let requireFile = path.join(dirname, matches[1]);
      let requireContents = getFileContents(requireFile);
      requireContents = `styles: [${requireContents}]`;
      fileContents = fileContents.replace(matches[0], requireContents);
      styleUrlsRegEx.lastIndex = 0;
      matches = styleUrlsRegEx.exec(fileContents);
    }

    fs.writeFileSync(file, fileContents, { encoding: 'utf8' });
  });
}

function getFileContents(filePath) {
  let contents = '';
  switch (path.extname(filePath)) {
    case '.scss':
      contents = compileSass(filePath);
      break;

    case '.html':
      contents = getHtmlContents(filePath);
      break;
  }

  contents = contents
    .toString()
    .replace(/\\f/g, '\\\\f')
    .replace(/`/g, '\\`');

  return '`' + contents + '`';
}

function getHtmlContents(filePath) {
  return fs.readFileSync(filePath).toString();
}

function compileSass(filePath) {
  return sass.renderSync({
    file: filePath,
    importer: tildeImporter,
    outputStyle: 'compressed'
  }).css;
}

module.exports = () => {
  copySource();
  deleteNonDistFiles();
  inlineHtmlCss();
};
