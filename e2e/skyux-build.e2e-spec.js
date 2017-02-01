/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs');
const path = require('path');
const common = require('./_common');

describe('skyux build', () => {

  beforeAll(common.beforeAll);
  afterAll(common.afterAll);

  it('should exit with exit code 0', (done) => {
    common.exec(`node`, [`../e2e/_cli`, `build`], common.opts)
      .then((exitCode) => {
        expect(exitCode).toEqual(0);
      }, common.execErr)
      .then(done, common.execErr);
  });

  it('should generate known assets', (done) => {
    const files = [
      'app.js',
      'index.html',
      'metadata.json',
      'polyfills.js',
      'skyux.js',
      'vendor.js'
    ];

    common.exec(`node`, [`../e2e/_cli`, `build`], common.opts)
      .then(() => {
        files.forEach(file => {
          expect(fs.existsSync(path.resolve(common.tmp, 'dist', file))).toEqual(true);
        });
      }, common.execErr)
      .then(done, common.execErr);
  });

});
