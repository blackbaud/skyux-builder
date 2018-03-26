/*jshint node: true*/
'use strict';

const glob = require('glob');
const path = require('path');

const { spaPath } = require('../config/sky-pages/sky-pages.config');
const codegen = require('../utils/codegen-utils');

const { isLocaleFile } = require('./locale-assets-processor');

function getClassName() {
  return 'SkyAppAssetsImplService';
}

function getSource() {
  const srcPath = spaPath('src');
  const assetsPath = spaPath('src', 'assets');

  const filePaths = glob.sync(
    spaPath('src', 'assets', '**', '*.*')
  );

  const pathMap = filePaths.map(filePath => {
    let key;
    let location;

    if (isLocaleFile(filePath)) {
      const basename = path.basename(filePath);
      key = path.join('locales', basename);
      location = path.join('~', 'assets', basename);
    } else {
      key = filePath.substr(assetsPath.length + 1);
      location = '~' + filePath.substr(srcPath.length);
    }

    return `'${key}': '${location}'`;
  });

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
