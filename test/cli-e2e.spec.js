/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');
const mock = require('mock-require');
const spawn = require('cross-spawn');
const selenium = require('selenium-standalone');
const logger = require('../utils/logger');

describe('cli e2e', () => {
  const PORT = 1234;
  const CHUNKS = [{ name: 'asdf' }];
  const SKY_PAGES_CONFIG = {
    skyux: {
      app: {},
      host: {
        url: 'asdf'
      }
    }
  };

  const ARGV = { a: true };
  const WEBPACK = { c: true };
  const configPath = path.resolve(
    __dirname,
    '..',
    'config',
    'protractor',
    'protractor.conf.js'
  );

  function infoCalledWith(msg) {
    let r = false;
    logger.info.calls.all().forEach(call => {
      if (call.args[0] === msg) {
        r = true;
      }
    });
    return r;
  }

  let EXIT_CODE;
  let PROTRACTOR_CB;
  let PROTRACTOR_CONFIG_FILE;
  let PROTRACTOR_CONFIG_ARGS;

  beforeEach(() => {
    EXIT_CODE = 0;

    mock('../cli/build', () => new Promise(resolve => {
      resolve({
        toJson: () => ({
          chunks: CHUNKS
        })
      });
    }));

    mock('cross-spawn', {
      sync: () => ({ })
    });

    mock('../cli/utils/server', {
      start: () => Promise.resolve(PORT),
      stop: () => {}
    });

    mock('glob', {
      sync: path => ['test.e2e-spec.ts']
    });

    mock('protractor/built/launcher', {
      init: (file, args) => {
        PROTRACTOR_CONFIG_FILE = file;
        PROTRACTOR_CONFIG_ARGS = args;
      }
    });

    spyOn(process, 'on').and.callFake((evt, cb) => {
      if (evt === 'exit') {
        PROTRACTOR_CB = cb;
        cb(EXIT_CODE);
      }
    });

    spyOn(logger, 'info');
  });

  afterEach(() => {
    EXIT_CODE = null;
    mock.stopAll();
  });

  it('should spawn protractor after build, server, and selenium, then kill servers', (done) => {
    spyOn(logger, 'warn');
    spyOn(process, 'exit').and.callFake(exitCode => {
      expect(exitCode).toEqual(EXIT_CODE);
      done();
    });

    EXIT_CODE = 1;
    mock.reRequire('../cli/e2e')(ARGV, SKY_PAGES_CONFIG, WEBPACK);
  });

  it('should catch protractor kitchen sink error', (done) => {
    spyOn(logger, 'warn');
    spyOn(process, 'exit').and.callFake(exitCode => {
      expect(logger.warn).toHaveBeenCalledWith('Supressing protractor\'s "kitchen sink" error 199');
      expect(exitCode).toEqual(0);
      done();
    });

    EXIT_CODE = 199;
    mock.reRequire('../cli/e2e')(ARGV, SKY_PAGES_CONFIG, WEBPACK);
  });

  it('should install, start, and kill selenium only if a seleniumAddress is specified', (done) => {
    let killCalled = false;

    mock(configPath, {
      config: {
        seleniumAddress: 'asdf'
      }
    });

    spyOn(selenium, 'install').and.callFake((config, cb) => {
      cb();
    });

    spyOn(selenium, 'start').and.callFake((cb) => {
      cb(null, {
        kill: () => killCalled = true
      });
    });

    spyOn(process, 'exit').and.callFake(exitCode => {
      expect(infoCalledWith('Selenium server is ready.')).toEqual(true);
      expect(killCalled).toEqual(true);
      expect(exitCode).toEqual(0);
      done();
    });

    mock.reRequire('../cli/e2e')(ARGV, SKY_PAGES_CONFIG, WEBPACK);
  });

  it('should catch build failures', (done) => {
    mock('../cli/build', () => Promise.reject(new Error('Build failed.')));

    spyOn(process, 'exit').and.callFake(exitCode => {
      expect(exitCode).toEqual(1);
      done();
    });

    mock.reRequire('../cli/e2e')(ARGV, SKY_PAGES_CONFIG, WEBPACK);
  });

  it('should catch selenium failures', (done) => {
    mock(configPath, {
      config: {
        seleniumAddress: 'asdf'
      }
    });

    spyOn(selenium, 'install').and.callFake((config, cb) => {
      cb();
    });

    spyOn(selenium, 'start').and.callFake((cb) => {
      let error = new Error('Selenium start failed.');
      cb(error, {});
    });

    spyOn(process, 'exit').and.callFake(exitCode => {
      expect(exitCode).toEqual(1);
      done();
    });

    mock.reRequire('../cli/e2e')(ARGV, SKY_PAGES_CONFIG, WEBPACK);
  });

  it('should catch protractor\'s selenium failures', (done) => {
    mock(configPath, {
      config: {}
    });

    mock('cross-spawn', {
      spawn: () => {
        return {
          on: () => { }
        };
      },
      sync: () => {
        return {
          error: new Error('Webdriver update failed.')
        };
      }
    });

    spyOn(process, 'exit').and.callFake(exitCode => {
      expect(exitCode).toEqual(1);
      done();
    });

    mock.reRequire('../cli/e2e')(ARGV, SKY_PAGES_CONFIG, WEBPACK);
  });

  it('should not continue if no e2e spec files exist', (done) => {
    mock('glob', {
      sync: path => []
    });

    spyOn(process, 'exit').and.callFake(exitCode => {
      expect(exitCode).toEqual(0);
      expect(logger.info).toHaveBeenCalledWith('No spec files located. Stopping command from running.');
      done();
    });

    mock.reRequire('../cli/e2e')(ARGV, SKY_PAGES_CONFIG, WEBPACK);
  });

  it('should accept the --no-build flag and handle errors', (done) => {

    spyOn(fs, 'existsSync').and.returnValue(false);

    mock.reRequire('../cli/e2e')({ build: false }, SKY_PAGES_CONFIG, WEBPACK);
    spyOn(process, 'exit').and.callFake(() => {
      const calls = logger.info.calls.allArgs();
      const message = `Unable to skip build step.  "dist/metadata.json" not found.`;
      expect(calls).toContain([message]);
      done();
    });

  });

  it('should accept the --no-build flag without errors', (done) => {
    const metadata = [{ name: 'file1.js' }];

    spyOn(fs, 'existsSync').and.returnValue(true);
    const fsSpy = spyOn(fs, 'readJsonSync').and.returnValue(metadata);

    mock.reRequire('../cli/e2e')({ build: false }, SKY_PAGES_CONFIG, WEBPACK);
    spyOn(process, 'exit').and.callFake(exitCode => {
      expect(fsSpy).toHaveBeenCalledWith('dist/metadata.json');
      expect(PROTRACTOR_CONFIG_ARGS.params.chunks).toEqual({
        metadata: metadata
      });
      expect(exitCode).toBe(0);
      done();
    });
  });

  it('should accept the config flag', (done) => {
    const config = 'custom-file1.js';
    const configResolve = path.resolve(config);

    spyOn(fs, 'existsSync').and.returnValue(true);
    spyOn(fs, 'readJsonSync').and.returnValue([]);

    mock(configResolve, {
      config: {
        custom: true
      }
    });

    mock.reRequire('../cli/e2e')({ build: false, config: config }, SKY_PAGES_CONFIG, WEBPACK);
    spyOn(process, 'exit').and.callFake(() => {
      expect(PROTRACTOR_CONFIG_FILE).toBe(configResolve);
      done();
    });
  });

  it('should show an error for a missing config file', (done) => {
    const config = 'custom-file2.js';
    const configResolve = path.resolve(config);

    spyOn(logger, 'error');
    spyOn(fs, 'existsSync').and.returnValue(false);

    mock.reRequire('../cli/e2e')({ build: false, config: config }, SKY_PAGES_CONFIG, WEBPACK);
    spyOn(process, 'exit').and.callFake(() => {
      expect(logger.error).toHaveBeenCalledWith(
        `ERROR [skyux e2e]: Unable to locate config file ${configResolve}`
      );
      done();
    });
  });

  it('should show an error for an invalid config file', (done) => {
    const config = 'custom-file2.js';
    const configResolve = path.resolve(config);

    spyOn(logger, 'error');
    spyOn(fs, 'existsSync').and.returnValue(true);
    spyOn(fs, 'readJsonSync').and.returnValue([]);

    mock(configResolve, {
      configInvalid: true
    });

    mock.reRequire('../cli/e2e')({ build: false, config: config }, SKY_PAGES_CONFIG, WEBPACK);
    spyOn(process, 'exit').and.callFake(() => {
      expect(logger.error).toHaveBeenCalledWith(
        `ERROR [skyux e2e]: Invalid config file ${configResolve}`
      );
      done();
    });
  });

});
