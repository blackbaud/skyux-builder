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

  const filePaths = glob.sync(
    spaPath('src', 'assets', '**', '*.*')
  );

  const pathMap = filePaths.map(file => {
    const basename = path.basename(file);
    const key = path.join('locales', basename);

    let location;
    if (isLocaleFile(file)) {
      location = path.join('~', 'assets', basename);
    } else {
      location = '~' + file.substr(srcPath.length);
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
