/*jshint node: true */
'use strict';

let fs = require('fs');

function generateComponentName(name) {
  return name.toLowerCase().split(' ').concat(['modal']).join('-');
}

//folder
function makeFolder(folder) {
  fs.mkdir(folder);
}

//css
function cssFileName(componentName) {
  return `${componentName}.component.scss`;
}

function makeCss(componentName, folderName) {
  fs.writeFile(`./${folderName}/${cssFileName(componentName)}`, '');
}

//html
function html(componentName) {
  return [
    '<sky-modal>',
    `  <sky-modal-header>${componentName}!</sky-modal-header>`,
    '  <sky-modal-content></sky-modal-content>',
    '</sky-modal>',
  ].join('\n');
}

function htmlFileName(componentName) {
  return `${componentName}.component.html`;
}

function makeHtml(componentName, folderName) {
  fs.writeFile(`./${folderName}/${htmlFileName(componentName)}`, html(componentName));
}
//ts
function className(componentName) {
  return componentName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

function tsFileName(componentName) {
  return `${componentName}.component.ts`;
}

function tsCode(componentName) {
  return [
  "import { Component } from '@angular/core';",
  "import { SkyModalInstance } from '@blackbaud/skyux/dist/core';",
  '',
  '@Component({',
  `  selector: '${componentName}',`,
  `  templateUrl: '${htmlFileName(componentName)}',`,
  `  styleUrls: ['${cssFileName(componentName)}']`,
  '});',
  '',
  `export class ${className(componentName)}Component {`,
  '',
  '  constructor(public instance: SkyModalInstance) { };',
  '',
  '};',
  ''
  ].join('\n');
}

function makeTS(componentName, folderName) {
  fs.writeFile(`./${folderName}/${tsFileName(componentName)}`, tsCode(componentName));
}

//spec
function specFileName(componentName) {
  return `${componentName}.component.spec.ts`;
}

function makeSpec(componentName, folderName) {
  fs.writeFile(`./${folderName}/${specFileName(componentName)}`, '');
}

//Add to app-extras.module.ts

function genFiles(name) {
  //massage name to my-component-modal
  const componentName = generateComponentName(name);
  //create folder
  makeFolder(componentName);
  //create scss
  makeCss(componentName, componentName);
  //create html
  makeHtml(componentName, componentName);
  //create ts
  makeTS(componentName, componentName);
  //create spec
  makeSpec(componentName, componentName);
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