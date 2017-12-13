/*jshint node: true */
'use strict';

const generatorUtils = require('./generator-utils');

function html(componentName) {
  return [
    '<sky-modal>',
    `  <sky-modal-header>${componentName}!</sky-modal-header>`,
    '  <sky-modal-content></sky-modal-content>',
    '</sky-modal>',
  ].join('\n');
}

function tsCode(className, filename, nameSnakeCase) {
  return [
  "import { Component } from '@angular/core';",
  "import { SkyModalInstance } from '@blackbaud/skyux/dist/core';",
  '',
  '@Component({',
  `  selector: '${nameSnakeCase}',`,
  `  templateUrl: '${filename}.html',`,
  `  styleUrls: ['${filename}.scss']`,
  '});',
  '',
  `export class ${className} {`,
  '',
  '  constructor(public instance: SkyModalInstance) { };',
  '',
  '};',
  ''
  ].join('\n');
}

function genFiles(name) {
  //massage name to my-component-modal
  const pathParts = generatorUtils.getPathParts(name);
  const classNameWithoutComponent = generatorUtils.properCase(pathParts.pop());
  const className = `${classNameWithoutComponent}Modal`;
  const nameSnakeCase = generatorUtils.snakeCase(classNameWithoutComponent);
  const fileName = `${nameSnakeCase}-modal.component`;

  generatorUtils.generateComponentFile(pathParts, fileName, '.html', html());
  generatorUtils.generateComponentFile(pathParts, fileName, '.scss', '');
  generatorUtils.generateComponentFile(pathParts, fileName, '.ts', tsCode(className, fielname, nameSnakeCase));
  generatorUtils.generateComponentFile(pathParts, fileName, '.spec', '');
}

module.exports = {
  generateComponentName,
  genFiles,
  html,
  tsCode,
  makeFolder,
  makeCss,
  makeHtml,
  makeTS,
  makeSpec
};