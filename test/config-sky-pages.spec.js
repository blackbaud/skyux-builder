/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs');
const path = require('path');
const proxyquire = require('proxyquire');
const logger = require('winston');

describe('config sky-pages', () => {

  it('should expose a getSkyPagesConfig method', () => {
    const lib = require('../config/sky-pages/sky-pages.config');
    expect(typeof lib.getSkyPagesConfig).toEqual('function');
  });

  it('getSkyPagesConfig should call the local sky-pages.json file', () => {

    spyOn(fs, 'existsSync').and.returnValue(false);
    let stubs = {};

    stubs[path.join(process.cwd(), 'sky-pages.json')] = {
      '@noCallThru': true,
      CUSTOM_PROP1: true
    };

    const lib = proxyquire('../config/sky-pages/sky-pages.config', stubs);
    const config = lib.getSkyPagesConfig();
    expect(config.CUSTOM_PROP1).toEqual(true);
  });

  it('should work if package.json exists without devDependencies', () => {
    spyOn(fs, 'existsSync').and.returnValue(true);
    let stubs = {};

    stubs[path.join(process.cwd(), 'package.json')] = {
      '@noCallThru': true
    };

    const lib = proxyquire('../config/sky-pages/sky-pages.config', stubs);
    const config = lib.getSkyPagesConfig();
    expect(config).toBeDefined();
  });

  it('should work if package.json exists with matching devDependencies', () => {
    spyOn(fs, 'existsSync').and.returnValue(true);
    let stubs = {};
    let called = false;

    stubs[path.join(process.cwd(), 'package.json')] = {
      '@noCallThru': true,
      devDependencies: {
        'blackbaud-sky-pages-in-test1': '0.0.1',
        'blackbaud-sky-pages-in-test2': '0.0.1'
      }
    };

    stubs[path.join(process.cwd(), 'node_modules', 'blackbaud-sky-pages-in-test1')] = {
      '@noCallThru': true
    };

    stubs[path.join(process.cwd(), 'node_modules', 'blackbaud-sky-pages-in-test2')] = {
      '@noCallThru': true,
      getSkyPagesConfig: () => {
        called = true;
      }
    };

    const lib = proxyquire('../config/sky-pages/sky-pages.config', stubs);
    lib.getSkyPagesConfig();
    expect(called).toEqual(true);
  });

  it('should read name from sky-pages.json else package.json', () => {
    const name = 'sky-pages-name';
    const lib = require('../config/sky-pages/sky-pages.config');
    const appBase = lib.getAppBase({
      name: name,
      'blackbaud-sky-pages-out-skyux2': {
        mode: 'advanced'
      }
    });
    expect(appBase).toEqual('/' + name + '/');
  });

});
