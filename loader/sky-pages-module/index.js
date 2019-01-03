/*jshint node: true*/
'use strict';

const path = require('path');
const fs = require('fs');
const generator = require('../../lib/sky-pages-module-generator');

module.exports = function () {

  // Hacky way to trigger rebuild of sky-pages.module.ts
  // Would love to find a better webpack way to handle this.
  const moduleFilename = 'sky-pages.module';
  const moduleResolved = path.join(__dirname, '..', '..', 'src', 'app', moduleFilename + '.ts');
  const template = fs.readFileSync(moduleResolved, { encoding: 'utf8' });
  const regex = /\/\/ TS \((.*)\)/;

  function writeTimeStamp() {
    const ts = +new Date();
    fs.writeFileSync(moduleResolved, template.replace(regex, `// TS (${ts}`));
  }

  // eslint-disable-next-line no-underscore-dangle
  this._compiler.plugin('invalid', function (filename) {
    const filenameParsed = path.parse(filename);
    switch (filenameParsed.ext) {
      case '.html':
        writeTimeStamp();
        break;

      case '.ts':
        if (filenameParsed.name !== 'sky-pages.module') {
          writeTimeStamp();
        }

        break;
    }
  });

  return generator.getSource(this.options.skyPagesConfig);
};
