/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const mock = require('mock-require');
const selenium = require('selenium-standalone');
const logger = require('@blackbaud/skyux-logger');

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
  let mockBuild;
  let mockCrossSpawn;

  beforeEach(() => {
    EXIT_CODE = 0;
    mockBuild = new Promise(resolve => {
      resolve({
        toJson: () => ({
          chunks: CHUNKS
        })
      });
    });

    mockCrossSpawn = {
      spawn() {
        return {};
      },
      sync() {
        return {};
      }
    };

    mock('../cli/build', () => {
      return mockBuild;
    });

    mock('cross-spawn', mockCrossSpawn);

    mock('../cli/utils/server', {
      start: () => Promise.resolve(PORT),
      stop: () => {}
    });

    mock('protractor/built/launcher', {
      init: (file, args) => {
        PROTRACTOR_CONFIG_FILE = file;
        PROTRACTOR_CONFIG_ARGS = args;
      }
    });

    mock('../cli/utils/config-resolver', {
      resolve: () => configPath
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
    spyOn(glob, 'sync').and.returnValue(['test.e2e-spec.ts']);
    spyOn(logger, 'warn');
    spyOn(process, 'exit').and.callFake(exitCode => {
      expect(exitCode).toEqual(EXIT_CODE);
      done();
    });

    EXIT_CODE = 1;
    mock.reRequire('../cli/e2e')('e2e', ARGV, SKY_PAGES_CONFIG, WEBPACK);
  });

  it('should catch protractor kitchen sink error', (done) => {
    spyOn(glob, 'sync').and.returnValue(['test.e2e-spec.ts']);
    spyOn(logger, 'warn');
    spyOn(process, 'exit').and.callFake(exitCode => {
      expect(logger.warn).toHaveBeenCalledWith('Supressing protractor\'s "kitchen sink" error 199');
      expect(exitCode).toEqual(0);
      done();
    });

    EXIT_CODE = 199;
    mock.reRequire('../cli/e2e')('e2e', ARGV, SKY_PAGES_CONFIG, WEBPACK);
  });

  it('should install, start, and kill selenium only if a seleniumAddress is specified', (done) => {
    let killCalled = false;

    mock(configPath, {
      config: {
        seleniumAddress: 'asdf',
        specs: ['']
      }
    });

    spyOn(glob, 'sync').and.returnValue(['test.e2e-spec.ts']);

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

    mock.reRequire('../cli/e2e')('e2e', ARGV, SKY_PAGES_CONFIG, WEBPACK);
  });

  it('should catch build failures', (done) => {
    mockBuild = Promise.reject(new Error('Build failed.'));

    spyOn(glob, 'sync').and.returnValue(['test.e2e-spec.ts']);
    spyOn(process, 'exit').and.callFake(exitCode => {
      expect(exitCode).toEqual(1);
      done();
    });

    mock.reRequire('../cli/e2e')('e2e', ARGV, SKY_PAGES_CONFIG, WEBPACK);
  });

  it('should catch selenium failures', (done) => {
    mock(configPath, {
      config: {
        seleniumAddress: 'asdf',
        specs: ['']
      }
    });

    spyOn(glob, 'sync').and.returnValue(['test.e2e-spec.ts']);
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

    mock.reRequire('../cli/e2e')('e2e', ARGV, SKY_PAGES_CONFIG, WEBPACK);
  });

  it('should catch protractor\'s selenium failures', (done) => {
    spyOn(glob, 'sync').and.returnValue(['test.e2e-spec.ts']);
    spyOn(mockCrossSpawn, 'sync').and.returnValue({
      error: new Error('Webdriver update failed.')
    });

    spyOn(process, 'exit').and.callFake(exitCode => {
      expect(exitCode).toEqual(1);
      done();
    });

    mock.reRequire('../cli/e2e')('e2e', ARGV, SKY_PAGES_CONFIG, WEBPACK);
  });

  it('should not continue if no spec files exist', (done) => {
    spyOn(glob, 'sync').and.returnValue([]);
    spyOn(process, 'exit').and.callFake(exitCode => {
      expect(exitCode).toEqual(0);
      expect(logger.info)
        .toHaveBeenCalledWith('No spec files located. Skipping e2e command.');
      done();
    });

    mock.reRequire('../cli/e2e')('e2e', ARGV, SKY_PAGES_CONFIG, WEBPACK);
  });

  it('should accept the --no-build flag and handle errors', (done) => {
    spyOn(glob, 'sync').and.returnValue(['test.e2e-spec.ts']);
    spyOn(fs, 'existsSync').and.returnValue(false);
    spyOn(process, 'exit').and.callFake(() => {
      const calls = logger.info.calls.allArgs();
      const message = `Unable to skip build step.  "dist/metadata.json" not found.`;
      expect(calls).toContain([message]);
      done();
    });

    mock.reRequire('../cli/e2e')('e2e', { build: false }, SKY_PAGES_CONFIG, WEBPACK);
  });

  it('should accept the --no-build flag and handle errors', (done) => {
    const metadata = [{ name: 'file1.js' }];

    spyOn(glob, 'sync').and.returnValue(['test.e2e-spec.ts']);
    spyOn(fs, 'existsSync').and.returnValue(true);
    const fsSpy = spyOn(fs, 'readJsonSync').and.returnValue(metadata);
    spyOn(process, 'exit').and.callFake(exitCode => {
      expect(fsSpy).toHaveBeenCalledWith('dist/metadata.json');
      expect(PROTRACTOR_CONFIG_ARGS.params.chunks).toEqual({
        metadata: metadata
      });
      expect(exitCode).toBe(0);
      done();
    });

    mock.reRequire('../cli/e2e')('e2e', { build: false }, SKY_PAGES_CONFIG, WEBPACK);
  });
});
