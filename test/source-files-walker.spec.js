/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const fs = require('fs-extra');
const glob = require('glob');

describe('SKY UX source files walker', () => {
  const walkerPath = '../lib/source-files-walker';
  const content = '';
  let config;

  beforeEach(() => {
    mock('../config/sky-pages/sky-pages.config', {
      spaPathTempSrc() {
        return '.skypagestemp/src/app';
      }
    });

    mock('../loader/sky-processor', {
      preload: () => 'changed content'
    });

    config = {
      resourcePath: '',
      options: {
        skyPagesConfig: {
          skyux: {}
        }
      }
    };

    spyOn(fs, 'writeFileSync').and.callFake(() => {});
  });

  afterEach(() => {
    mock.stop('../config/sky-pages/sky-pages.config');
    mock.stop('../loader/sky-processor');
  });

  it('should return a method', () => {
    const walkSourceFiles = require(walkerPath);
    expect(typeof walkSourceFiles).toEqual('function');
  });

  it('should generate an array of file paths and contents for the SPA\'s source', () => {
    spyOn(glob, 'sync').and.returnValue([ 'my-file.js' ]);
    spyOn(fs, 'readFileSync').and.returnValue('');
    const walkSourceFiles = require(walkerPath);
    walkSourceFiles(config);
    expect(glob.sync).toHaveBeenCalled();
    expect(fs.readFileSync).toHaveBeenCalled();
  });

  it('should handle an invalid root directory', () => {
    spyOn(glob, 'sync').and.callThrough();
    const walkSourceFiles = require(walkerPath);
    walkSourceFiles(config);
    expect(fs.readdirSync).toThrow();
  });

  it('should allow plugin preload hooks to alter the content', () => {
    spyOn(glob, 'sync').and.returnValue([ 'my-file.js' ]);
    spyOn(fs, 'readFileSync').and.returnValue('');
    const walkSourceFiles = require(walkerPath);
    walkSourceFiles(config);
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('should not alter the content of a file if nothing has changed', () => {
    spyOn(glob, 'sync').and.returnValue([ 'my-file.js' ]);
    spyOn(fs, 'readFileSync').and.returnValue('changed content');
    const walkSourceFiles = require(walkerPath);
    walkSourceFiles(config);
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });
});
