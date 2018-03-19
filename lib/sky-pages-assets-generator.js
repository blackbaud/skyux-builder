/*jshint node: true*/
'use strict';

const fs = require('fs-extra');
const glob = require('glob');

const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');
const codegen = require('../utils/codegen-utils');

function getClassName() {
  return 'SkyAppAssetsImplService';
}

function getSource() {
  const srcPath = skyPagesConfigUtil.spaPath('src');
  const assetsPath = skyPagesConfigUtil.spaPath('src', 'assets');

  const filePaths = glob.sync(skyPagesConfigUtil.spaPath('src', 'assets', '**', '*.*'));

  const pathMap = filePaths.map(
    filePath => `'${filePath.substr(assetsPath.length + 1)}': '~${filePath.substr(srcPath.length)}'`
  );

  const localesSource = getLocalesSource();

  let src =
`export class ${getClassName()} {
  public getUrl(filePath: string): string {
    const pathMap: {[key: string]: any} = {
      ${pathMap.join(',\n' + codegen.indent(3))}
    };

    return pathMap[filePath];
  }

  public getResourcesForLocale(locale: string): any {
    const resources: {[key: string]: any} = ${localesSource};
    return resources[locale];
  }
}`;

  return src;
}

function getLocalesSource() {
  const localesPath = ['src', 'assets', 'locales', 'resources_*.json'];
  const files = glob.sync(skyPagesConfigUtil.spaPath(...localesPath))
    .concat(
      glob.sync(skyPagesConfigUtil.spaPath(
        'node_modules', '@blackbaud', '**', ...localesPath
      ))
    );

  const resources = {};
  files.forEach((filePath) => {
    const key = filePath.split('resources_')[1].split('.json')[0];
    const contents = fs.readJSONSync(filePath);

    if (resources[key]) {
      resources[key] = Object.assign(resources[key], contents);
    } else {
      resources[key] = contents;
    }
  });

  return JSON.stringify(resources);
}

module.exports = {
  getSource: getSource,
  getClassName: getClassName
};
