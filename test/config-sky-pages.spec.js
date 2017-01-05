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

  it('getSkyPagesConfig should call the local skyuxconfig.json file', () => {

    spyOn(fs, 'existsSync').and.returnValue(false);
    let stubs = {};

    stubs[path.join(process.cwd(), 'skyuxconfig.json')] = {
      '@noCallThru': true,
      CUSTOM_PROP1: true
    };

    const lib = proxyquire('../config/sky-pages/sky-pages.config', stubs);
    const config = lib.getSkyPagesConfig();
    expect(config.CUSTOM_PROP1).toEqual(true);
  });

  it('should read name from skyuxconfig.json else package.json', () => {
    const name = 'sky-pages-name';
    const lib = require('../config/sky-pages/sky-pages.config');
    const appBase = lib.getAppBase({
      name: name,
      mode: 'advanced'
    });
    expect(appBase).toEqual('/' + name + '/');
  });

});
