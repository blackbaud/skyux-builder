/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs-extra');
const mock = require('mock-require');

describe('cli utils prepare-library-package', () => {
  let util;

  beforeEach(() => {
    mock('../config/sky-pages/sky-pages.config', {
      spaPath: (...segments) => segments.join('/'),
      spaPathTempSrc: () => '',
      spaPathTemp: () => ''
    });
    util = mock.reRequire('../cli/utils/prepare-library-package');
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should return a function', () => {
    expect(typeof util).toEqual('function');
  });

  it('should update the module property of package.json and write it to dist', () => {
    spyOn(fs, 'copySync').and.returnValue();
    spyOn(fs, 'readJsonSync').and.returnValue({});
    spyOn(fs, 'writeJsonSync').and.callFake((filePath, contents) => {
      expect(filePath.match('dist')).not.toEqual(null);
      expect(contents.module).toEqual('index.js');
    });
    util();
    expect(fs.readJsonSync).toHaveBeenCalled();
    expect(fs.writeJsonSync).toHaveBeenCalled();
  });

  it('should copy contributing and changelog to dist', () => {
    spyOn(fs, 'readJsonSync').and.returnValue({});
    spyOn(fs, 'writeJsonSync').and.returnValue();
    spyOn(fs, 'copySync').and.returnValue();
    util();
    expect(fs.copySync).toHaveBeenCalledWith('README.md', 'dist/README.md');
    expect(fs.copySync).toHaveBeenCalledWith('CHANGELOG.md', 'dist/CHANGELOG.md');
  });
});
