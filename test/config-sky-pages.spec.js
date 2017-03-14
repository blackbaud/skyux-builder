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

  it('should load the local skyuxconfig.json file if it exists', () => {
    spyOn(logger, 'info');
    spyOn(fs, 'existsSync').and.callFake(f => f.indexOf('skyuxconfig.json') > -1);
    spyOn(fs, 'readFileSync').and.returnValue(JSON.stringify({
      baseline: true
    }));

    const lib = require('../config/sky-pages/sky-pages.config');
    const config = lib.getSkyPagesConfig('build');
    expect(config.baseline).toEqual(true);
    expect(logger.info).toHaveBeenCalledWith(
      `Merging local config skyuxconfig.json`
    );
  });

  it('should local the matching skyuxconfig.command.json file if it exists', () => {
    const cmd = 'asdf';

    spyOn(logger, 'info');
    spyOn(fs, 'existsSync').and.callFake(f => f.indexOf(`skyuxconfig.${cmd}.json`) > -1);
    spyOn(fs, 'readFileSync').and.returnValue(JSON.stringify({
      baseline: true
    }));

    const lib = require('../config/sky-pages/sky-pages.config');
    const config = lib.getSkyPagesConfig(cmd);
    expect(config.baseline).toEqual(true);
    expect(logger.info).toHaveBeenCalledWith(
      `Merging command config skyuxconfig.${cmd}.json`
    );
  });

  it('should work if no config files exist', () => {
    spyOn(fs, 'existsSync').and.returnValue(false);
    const lib = require('../config/sky-pages/sky-pages.config');
    const config = lib.getSkyPagesConfig('build');
    expect(config.baseline).not.toEqual(true);
  });

});
