/*jshint node: true*/
'use strict';

const glob = require('glob');

const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');
const codegen = require('../utils/codegen-utils');

const localeAssetsProcessor = require('./locale-assets-processor');

function getClassName() {
  return 'SkyAppAssetsImplService';
}

function getSource() {
  const srcPath = skyPagesConfigUtil.spaPath('src');
  const assetsPath = skyPagesConfigUtil.spaPath('src', 'assets');

  let filePaths = glob.sync(
    skyPagesConfigUtil.spaPath('src', 'assets', '**', '*.*')
  );

  // Use auto-generated en-US file even if site has no file.
  // This will let sites use consumed library files without having to create their own en_US file.
  const hasLocaleFile = filePaths.some(filePath => localeAssetsProcessor.isLocaleFile(filePath));
  if (!hasLocaleFile) {
    filePaths = filePaths.concat(
      localeAssetsProcessor.getDefaultLocaleFiles('.skypageslocales')
    );
  }

  const pathMap = filePaths.map(filePath => {
    let key;
    let location;

    if (localeAssetsProcessor.isLocaleFile(filePath)) {
      const basename = localeAssetsProcessor.parseLocaleFileBasename(filePath);
      key = ['locales', basename].join('/');
      location = ['~', 'assets', basename].join('/');
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
  getSource: getSource,
  getClassName: getClassName
};
