/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs');
const logger = require('winston');

describe('config sky-pages', () => {

  it('should expose a getSkyPagesConfig method', () => {
    const lib = require('../config/sky-pages/sky-pages.config');
    expect(typeof lib.getSkyPagesConfig).toEqual('function');
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

  it('should handle no local configuration files', () => {
    let hasBaseline = false;
    spyOn(logger, 'info');
    spyOn(fs, 'existsSync').and.callFake(file => {
      if (!hasBaseline) {
        hasBaseline = true;
        return true;
      }

      return false;
    });
    spyOn(fs, 'readFileSync').and.returnValue(JSON.stringify({
      baseline: true
    }));

    const lib = require('../config/sky-pages/sky-pages.config');
    const config = lib.getSkyPagesConfig();

    console.log(config);

    expect(config.baseline).toEqual(true);
    expect(logger.info).toHaveBeenCalledWith(
      `Using default skyuxconfig.json configuration.`
    );
  });

  it('should use the local skyuxconfig.json as the default, if it exists', () => {
    spyOn(logger, 'info');
    spyOn(fs, 'existsSync').and.callFake(f => f.indexOf('skyuxconfig.json') > -1);
    spyOn(fs, 'readFileSync').and.returnValue(JSON.stringify({
      custom: true
    }));

    const lib = require('../config/sky-pages/sky-pages.config');
    const config = lib.getSkyPagesConfig();
    expect(config.custom).toEqual(true);
    expect(logger.info).toHaveBeenCalledWith(
      `Processing config file ${lib.spaPath('skyuxconfig.json')}`
    );
  });

  it('should read the shorthand -c flag', () => {
    spyOn(logger, 'info');
    spyOn(fs, 'existsSync').and.callFake(f => f.indexOf('test.json') > -1);
    spyOn(fs, 'readFileSync').and.returnValue(JSON.stringify({
      custom: true
    }));

    const lib = require('../config/sky-pages/sky-pages.config');
    const config = lib.getSkyPagesConfig({
      c: 'test.json'
    });
    expect(config.custom).toEqual(true);
    expect(logger.info).toHaveBeenCalledWith(
      `Processing config file test.json`
    );
  });

  it('should read the --config flag', () => {
    spyOn(logger, 'info');
    spyOn(fs, 'existsSync').and.callFake(f => f.indexOf('test.json') > -1);
    spyOn(fs, 'readFileSync').and.returnValue(JSON.stringify({
      custom: true
    }));

    const lib = require('../config/sky-pages/sky-pages.config');
    const config = lib.getSkyPagesConfig({
      config: 'test.json'
    });
    expect(config.custom).toEqual(true);
    expect(logger.info).toHaveBeenCalledWith(
      `Processing config file test.json`
    );
  });

  it('should handle the SKYUX_ENV environment variable and a matching file', () => {
    spyOn(logger, 'info');
    spyOn(fs, 'existsSync').and.callFake(f => f.indexOf('skyuxconfig.env.json') > -1);
    spyOn(fs, 'readFileSync').and.returnValue(JSON.stringify({
      custom: true
    }));

    process.env.SKYUX_ENV = 'env';
    const lib = require('../config/sky-pages/sky-pages.config');
    const config = lib.getSkyPagesConfig();
    expect(config.custom).toEqual(true);
    expect(logger.info).toHaveBeenCalledWith(
      `Processing config file ${lib.spaPath('skyuxconfig.env.json')}`
    );
  });

  it('should handle the SKYUX_ENV environment variable without a matching file', () => {
    spyOn(fs, 'existsSync').and.returnValue(false);
    process.env.SKYUX_ENV = 'env';
    const lib = require('../config/sky-pages/sky-pages.config');
    const config = lib.getSkyPagesConfig();
    expect(config.custom).not.toEqual(true);
    delete process.env.SKYUX_ENV;
  });

  it('should recursively follow the extends property of a config file', () => {
    spyOn(logger, 'info');
    spyOn(fs, 'existsSync').and.returnValue(true);
    spyOn(fs, 'readFileSync').and.callFake(file => {
      let config = '';
      if (file.indexOf('skyuxconfig.json') > -1) {
        config = {
          extends: 'A.json',
          test: 'asdf',
          test4: 'jkl',
          test5: '1234',
          test1: true
        };
      } else if (file.indexOf('A.json') > -1) {
        config = {
          extends: 'B.json',
          test: '1234',
          test4: 'asdf',
          test2: false
        };
      } else if (file.indexOf('B.json') > -1) {
        config = {
          test: 'jkl',
          test3: true
        };
      }

      return JSON.stringify(config);
    });

    const lib = require('../config/sky-pages/sky-pages.config');
    const config = lib.getSkyPagesConfig();
    expect(config.test).toEqual('asdf');
    expect(config.test1).toEqual(true);
    expect(config.test2).toEqual(false);
    expect(config.test3).toEqual(true);
    expect(config.test4).toEqual('jkl');
    expect(config.test5).toEqual('1234');
    expect(logger.info).toHaveBeenCalledWith(
      `Processing config file ${lib.spaPath('skyuxconfig.json')}`
    );
    expect(logger.info).toHaveBeenCalledWith(
      `Processing config file ${lib.spaPath('A.json')}`
    );
    expect(logger.info).toHaveBeenCalledWith(
      `Processing config file ${lib.spaPath('B.json')}`
    );
  });

  it('should handle files that do not exist', () => {
    spyOn(logger, 'error');
    spyOn(fs, 'existsSync').and.callFake(f => f.indexOf('test.json') === -1);

    const lib = require('../config/sky-pages/sky-pages.config');
    const config = lib.getSkyPagesConfig({
      config: 'test.json'
    });
    expect(config.custom).not.toEqual(true);
    expect(logger.error).toHaveBeenCalledWith(
      `Unable to locate config file test.json`
    );
  });

});
