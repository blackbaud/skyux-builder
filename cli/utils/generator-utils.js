/*jshint node: true*/
'use strict';

const fs = require('fs-extra');
const path = require('path');

function getPathParts(name) {
  return name.replace(/\\/g, '/').split('/');
}

function generateComponentFile(pathParts, fileName, extension, text) {
  fs.writeFileSync(resolveFilePath(pathParts, fileName + extension), text);
}

function properCase(name) {
  let nameProper = '';

  for (let i = 0, n = name.length; i < n; i++) {
    let c = name.charAt(i);

    if (c !== '-') {
      if (nameProper.length === 0 || name.charAt(i - 1) === '-') {
        c = c.toUpperCase();
      }

      nameProper += c;
    }
  }

  return nameProper;
}

function snakeCase(name) {
  let nameSnake = '';

  for (let i = 0, n = name.length; i < n; i++) {
    const c = name.charAt(i);
    const cLower = c.toLowerCase();

    if (i > 0 && c !== cLower) {
      nameSnake += '-';
    }

    nameSnake += cLower;
  }

  return nameSnake;
}

/* Private */
function resolveFilePath(pathParts, fileName) {
  fs.ensureDirSync(path.resolve('src', 'app', ...pathParts));

  return path.resolve('src', 'app', ...pathParts, fileName);
}

module.exports = {
  getPathParts,
  generateComponentFile,
  properCase,
  snakeCase
};