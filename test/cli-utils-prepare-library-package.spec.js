/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs-extra');
const mock = require('mock-require');
const logger = require('@blackbaud/skyux-logger');

describe('cli utils prepare-library-package', () => {
  let util;

  beforeEach(() => {
    mock('../config/sky-pages/sky-pages.config', {
      spaPath: (...args) => args.join('/')
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
    spyOn(fs, 'existsSync').and.returnValue(true);
    util();
    expect(fs.readJsonSync).toHaveBeenCalled();
    expect(fs.writeJsonSync).toHaveBeenCalled();
  });

  it('should copy readme, changelog, and assets to dist', () => {
    spyOn(fs, 'readJsonSync').and.returnValue({});
    spyOn(fs, 'writeJsonSync').and.returnValue();
    spyOn(fs, 'copySync').and.returnValue();
    spyOn(fs, 'existsSync').and.returnValue(true);
    util();
    expect(fs.copySync).toHaveBeenCalledWith('README.md', 'dist/README.md');
    expect(fs.copySync).toHaveBeenCalledWith('CHANGELOG.md', 'dist/CHANGELOG.md');
    expect(fs.copySync).toHaveBeenCalledWith('src/assets', 'dist/src/assets');
  });

  it('should warn consumers if they do not include a readme, changelog, or assets', () => {
    const loggerSpy = spyOn(logger, 'warn');

    spyOn(fs, 'readJsonSync').and.returnValue({});
    spyOn(fs, 'writeJsonSync').and.returnValue();
    spyOn(fs, 'copySync').and.callFake(() => {});
    spyOn(fs, 'existsSync').and.returnValue(false);
    util();
    expect(loggerSpy).toHaveBeenCalledWith('File(s) not found: README.md');
  });
});
