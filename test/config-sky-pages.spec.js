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

  it('should accept the shorthand flag c for the config flag', () => {
    spyOn(fs, 'existsSync').and.returnValue(true);
    spyOn(logger, 'info');
    let stubs = {};

    const argv = {
      c: 'my-valid-file.json'
    };

    stubs[path.join(process.cwd(), 'my-valid-file.json')] = {
      '@noCallThru': true,
      CUSTOM_PROP1: true
    };

    const lib = proxyquire('../config/sky-pages/sky-pages.config', stubs);
    const config = lib.getSkyPagesConfig(argv);

    expect(config.CUSTOM_PROP1).toEqual(true);
    expect(logger.info).toHaveBeenCalledWith(
      `Successfully located requested config file ${argv.config}`
    );
  });

  it('should accept the config flag with a single valid file', () => {
    spyOn(fs, 'existsSync').and.returnValue(true);
    spyOn(logger, 'info');
    let stubs = {};

    const argv = {
      config: 'my-valid-file.json'
    };

    stubs[path.join(process.cwd(), 'my-valid-file.json')] = {
      '@noCallThru': true,
      CUSTOM_PROP1: true
    };

    const lib = proxyquire('../config/sky-pages/sky-pages.config', stubs);
    const config = lib.getSkyPagesConfig(argv);

    expect(config.CUSTOM_PROP1).toEqual(true);
    expect(logger.info).toHaveBeenCalledWith(
      `Successfully located requested config file ${argv.config}`
    );
  });

  it('should accept the config flag with a single invalid file', () => {
    spyOn(fs, 'existsSync').and.returnValue(false);
    spyOn(logger, 'error');

    const argv = {
      config: 'my-invalid-file.json'
    };
    const lib = require('../config/sky-pages/sky-pages.config');
    lib.getSkyPagesConfig(argv);

    expect(logger.error).toHaveBeenCalledWith(
      `Unable to locate requested config file ${argv.config}`
    );
  });

  it('should accept the config flag with an array of valid files', () => {
    spyOn(fs, 'existsSync').and.returnValue(true);
    spyOn(logger, 'info');
    let stubs = {};

    const argv = {
      config: 'my-valid-file1.json,my-valid-file2.json'
    };

    stubs[path.join(process.cwd(), 'my-valid-file1.json')] = {
      '@noCallThru': true,
      CUSTOM_PROP1: true,
      CUSTOM_PROP2: 'asdf'
    };

    stubs[path.join(process.cwd(), 'my-valid-file2.json')] = {
      '@noCallThru': true,
      CUSTOM_PROP2: 'jkl',
      CUSTOM_PROP3: true
    };

    const lib = proxyquire('../config/sky-pages/sky-pages.config', stubs);
    const config = lib.getSkyPagesConfig(argv);

    expect(config.CUSTOM_PROP1).toEqual(true);
    expect(config.CUSTOM_PROP2).toEqual('jkl');
    expect(config.CUSTOM_PROP3).toEqual(true);
    expect(logger.info).toHaveBeenCalledWith(
      `Successfully located requested config file my-valid-file1.json`
    );
    expect(logger.info).toHaveBeenCalledWith(
      `Successfully located requested config file my-valid-file2.json`
    );
  });

  it('should accept the config flag with an array of valid and invalid files', () => {

    spyOn(fs, 'existsSync').and.callFake(f => f.indexOf('my-valid-file.json') > -1);
    spyOn(logger, 'info');
    spyOn(logger, 'error');
    let stubs = {};

    const argv = {
      config: 'my-valid-file.json,my-invalid-file.json'
    };

    stubs[path.join(process.cwd(), 'my-valid-file.json')] = {
      '@noCallThru': true,
      CUSTOM_PROP1: true
    };

    const lib = proxyquire('../config/sky-pages/sky-pages.config', stubs);
    const config = lib.getSkyPagesConfig(argv);

    expect(config.CUSTOM_PROP1).toEqual(true);
    expect(logger.info).toHaveBeenCalledWith(
      `Successfully located requested config file my-valid-file.json`
    );
    expect(logger.error).toHaveBeenCalledWith(
      `Unable to locate requested config file my-invalid-file.json`
    );
  });

});
