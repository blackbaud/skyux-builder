/*jshint jasmine: true, node: true */
'use strict';

const logger = require('winston');
const mock = require('mock-require');
const fs = require('fs-extra');

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
      init: () => {},
      processContent: () => ''
    });

    config = {
      resourcePath: '',
      options: {
        skyPagesConfig: {
          skyux: {}
        }
      }
    };
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
    spyOn(fs, 'readdirSync').and.returnValue([ 'my-file.js' ]);
    spyOn(fs, 'readFileSync').and.returnValue('');
    spyOn(fs, 'statSync').and.returnValue({
      isDirectory() {
        return false;
      }
    });
    const walkSourceFiles = require(walkerPath);
    walkSourceFiles(config);
    expect(fs.readdirSync).toHaveBeenCalled();
    expect(fs.readFileSync).toHaveBeenCalled();
  });

  it('should handle an invalid root directory', () => {
    spyOn(fs, 'readdirSync').and.callThrough();
    const walkSourceFiles = require(walkerPath);
    walkSourceFiles(config);
    expect(fs.readdirSync).toThrow();
  });

  it('should recursively walk through directories', () => {
    let checked = false;
    spyOn(fs, 'readdirSync').and.returnValue([ 'my-file.js', 'my-dir' ]);
    spyOn(fs, 'readFileSync').and.returnValue('');
    spyOn(fs, 'statSync').and.returnValue({
      isDirectory() {
        if (checked) {
          return false;
        }

        checked = true;
        return true;
      }
    });

    const walkSourceFiles = require(walkerPath);
    walkSourceFiles(config);
    expect(fs.statSync).toHaveBeenCalled();
  });

  it('should allow plugin preload hooks to alter the content', () => {
    spyOn(fs, 'readdirSync').and.returnValue([ 'my-file.js' ]);
    spyOn(fs, 'readFileSync').and.returnValue('changed content');
    spyOn(fs, 'statSync').and.returnValue({
      isDirectory() {
        return false;
      }
    });
    spyOn(fs, 'writeFileSync').and.callFake(() => {});
    const walkSourceFiles = require(walkerPath);
    walkSourceFiles(config);
    expect(fs.writeFileSync).toHaveBeenCalled();
  });
});
