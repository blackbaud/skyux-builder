/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs-extra');
const logger = require('@blackbaud/skyux-logger');

describe('config sky-pages', () => {

  it('should expose a getSkyPagesConfig method', () => {
    const lib = require('../config/sky-pages/sky-pages.config');
    expect(typeof lib.getSkyPagesConfig).toEqual('function');
  });

  it('should read name from skyuxconfig.json else package.json', () => {
    const name = 'sky-pages-name';
    const lib = require('../config/sky-pages/sky-pages.config');
    const appBase = lib.getAppBase({
      skyux: {
        name: name,
        mode: 'advanced'
      }
    });
    expect(appBase).toEqual('/' + name + '/');
  });

  it('should load the config files that exist in order', () => {
    const tempSpaReference = 'SPA_REFERENCE';
    const readJsonSync = fs.readJsonSync;
    const existsSync = fs.existsSync;

    spyOn(logger, 'info');
    spyOn(process, 'cwd').and.returnValue(tempSpaReference);
    spyOn(fs, 'existsSync').and.callFake(filename => {

      // Catch our package.json
      if (filename.includes('package.json')) {
        return true;
      }

      // Catch any skyuxconfig files
      if (filename.includes('skyuxconfig.json') || filename.includes('skyuxconfig.build.json')) {
        return true;
      }

      // Pass through normal behavior
      return existsSync(filename);
    });

    spyOn(fs, 'readJsonSync').and.callFake((filename, encoding) => {

      const isSpaDirectory = filename.includes(tempSpaReference);
      const isDefaultConfig = filename.includes('skyuxconfig.json');
      const isCommandConfig = filename.includes('skyuxconfig.build.json');
      let config = {};

      // Catch our package.json
      if (filename.includes('package.json')) {
        return JSON.stringify({
          name: 'my-app-name'
        });
      }

      // Catch our skyuxconfig files
      if (isDefaultConfig || isCommandConfig) {

        // Asking for builder's skyuxconfig.json
        if (!isSpaDirectory && isDefaultConfig) {
          config.a = 1; // Merged through entire process
          config.z = 9; // Unique to this file
          config.o = {
            keyOne: 'keyOne',
            keyTwo: {
              nestedTwo: 'nestedTwo'
            }
          }; // Testing recursive merge
          config.n = {
            toDelete: true
          }; // Testing merge override
          config.arr = ['stringTwo'] // Testing array values not concatenated

        // Asking for builder's skyuxconfig.build.json
        } else if (!isSpaDirectory && isCommandConfig) {
          config.a = 2; // Merged through entire process
          config.b = 1; // Starts here and merged up
          config.y = 8; // Unique to this file

        // Asking for SPA's skyuxconfig.json
        } else if (isSpaDirectory && isDefaultConfig) {
          config.a = 3; // Merged through entire process
          config.b = 2;
          config.c = 1; // Starts here and merged up
          config.x = 7; // Unique to this file

        // Asking for SPA's skyuxconfig.json
        } else if (isSpaDirectory && isCommandConfig) {
          config.a = 4; // Merged through entire process
          config.b = 3;
          config.c = 2;
          config.w = 6; // Unique to this file
          config.o = {
            keyOne: 'changed',
            keyTwo: {
              nestedTwo: 'changed'
            }
          };
          config.n = null;
          config.arr = ['stringOne', 'stringThree'];
        }

        return config;
      }

      // Pass through normal behavior
      return readJsonSync(filename, encoding);
    });

    const lib = require('../config/sky-pages/sky-pages.config');
    const config = lib.getSkyPagesConfig('build').skyux;

    expect(config.a).toEqual(4);
    expect(config.b).toEqual(3);
    expect(config.c).toEqual(2);
    expect(config.w).toEqual(6);
    expect(config.x).toEqual(7);
    expect(config.y).toEqual(8);
    expect(config.z).toEqual(9);
    expect(config.o.keyOne).toEqual('changed');
    expect(config.o.keyTwo.nestedTwo).toEqual('changed');
    expect(config.n).toEqual(null);
    expect(config.arr.length).toBe(2);
    expect(config.arr).not.toContain('stringTwo');

    expect(logger.info.calls.allArgs()).toEqual([
      ['Merging App Builder skyuxconfig.json'],
      ['Merging App Builder skyuxconfig.build.json'],
      ['Merging SPA skyuxconfig.json'],
      ['Merging SPA skyuxconfig.build.json']
    ]);
  });

  it('should handle config files that do not exist', () => {
    spyOn(logger, 'info');
    spyOn(fs, 'existsSync').and.returnValue(false);
    spyOn(logger, 'error');

    const command = 'build';
    const lib = require('../config/sky-pages/sky-pages.config');
    const config = lib.getSkyPagesConfig(command);

    expect(config.skyux).toEqual({});
    expect(config.runtime.command).toEqual(command);
    expect(logger.error).toHaveBeenCalledWith(
      'The `name` property should exist in package.json or skyuxconfig.json'
    );
  });

});
