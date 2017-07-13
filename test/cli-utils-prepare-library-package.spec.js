/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs-extra');
const glob = require('glob');
const mock = require('mock-require');
const sass = require('node-sass');

describe('cli utils prepare-library-package', () => {
  let util;

  beforeEach(() => {
    mock('../config/sky-pages/sky-pages.config', {
      spaPath: (...segments) => segments.join('/'),
      spaPathTempSrc: () => '',
      spaPathTemp: () => ''
    });
    util = require('../cli/utils/prepare-library-package');
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should return a function', () => {
    expect(typeof util).toEqual('function');
  });

  it('should update the module property of package.json and write it to dist', () => {
    spyOn(fs, 'copySync').and.returnValue();
    spyOn(fs, 'readJSONSync').and.returnValue({});
    spyOn(fs, 'writeJSONSync').and.callFake((filePath, contents) => {
      expect(filePath.match('dist')).not.toEqual(null);
      expect(contents.module).toEqual('index.js');
    });
    util();
    expect(fs.readJSONSync).toHaveBeenCalled();
    expect(fs.writeJSONSync).toHaveBeenCalled();
  });

  it('should copy contributing and changelog to dist', () => {
    spyOn(fs, 'readJSONSync').and.returnValue({});
    spyOn(fs, 'writeJSONSync').and.returnValue();
    spyOn(fs, 'copySync').and.returnValue();
    util();
    expect(fs.copySync).toHaveBeenCalledWith('README.md', 'dist/README.md');
    expect(fs.copySync).toHaveBeenCalledWith('CHANGELOG.md', 'dist/CHANGELOG.md');
  });
});
