/*jshint node: true*/
'use strict';

const glob = require('glob');
const path = require('path');

const { spaPath } = require('../config/sky-pages/sky-pages.config');
const codegen = require('../utils/codegen-utils');

function getClassName() {
  return 'SkyAppAssetsImplService';
}

function getSource() {
  const srcPath = spaPath('src');
  const assetsPath = spaPath('src', 'assets');
  const localesPath = spaPath('.skypageslocales');

  const filePaths = glob.sync(
    spaPath('src', 'assets', '**', '*.*'),
    {
      ignore: '**/resources_*.json'
    }
  );

  const localeFilePaths = glob.sync(
    path.join(localesPath, '**', 'resources_*.json')
  );

  let pathMap = filePaths.map(
    filePath => `'${filePath.substr(assetsPath.length + 1)}': '~${filePath.substr(srcPath.length)}'`
  );

  pathMap = pathMap.concat(
    localeFilePaths.map(file => {
      const key = path.join('locales', path.basename(file));
      const location = path.join('~', 'assets', 'locales', file.substr(localesPath.length));
      return `'${key}': '${location}'`;
    })
  );

  const src =
`export class ${getClassName()} {
  public getUrl(filePath: string): string {
    const pathMap: {[key: string]: any} = {
      ${pathMap.join(',\n' + codegen.indent(3))}
    };

    return pathMap[filePath];
  }
}`;

  return src;
}

module.exports = {
  getSource,
  getClassName
};
