/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');
const mock = require('mock-require');
const spawn = require('cross-spawn');
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

  beforeEach(() => {
    EXIT_CODE = 0;

    mock('../cli/utils/run-build', () => new Promise(resolve => {
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

    mock('../cli/utils/config-resolver', {
      resolve: () => configPath
    });

    mock('chromedriver-version-matcher', {
      getChromeDriverVersion: () => Promise.resolve()
    });

    spyOn(process, 'on').and.callFake((evt, cb) => {
      if (evt === 'exit') {
        PROTRACTOR_CB = cb;
        cb(EXIT_CODE);
      }
    });

    spyOn(logger, 'info');
    spyOn(logger, 'error');
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
    mock.reRequire('../cli/e2e')('e2e', ARGV, SKY_PAGES_CONFIG, WEBPACK);
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

    mock.reRequire('../cli/e2e')('e2e', ARGV, SKY_PAGES_CONFIG, WEBPACK);
  });

  it('should catch build failures', (done) => {
    mock('../cli/utils/run-build', () => Promise.reject(new Error('Build failed.')));

    spyOn(process, 'exit').and.callFake(exitCode => {
      expect(exitCode).toEqual(1);
      done();
    });

    mock.reRequire('../cli/e2e')('e2e', ARGV, SKY_PAGES_CONFIG, WEBPACK);
  });

  it('should catch selenium failures', (done) => {

    let error;

    mock(configPath, {
      config: {
        seleniumAddress: 'asdf'
      }
    });

    spyOn(selenium, 'install').and.callFake((config, cb) => {
      cb();
    });

    spyOn(selenium, 'start').and.callFake((cb) => {
      error = new Error('Selenium start failed.');
      cb(error, {});
    });

    spyOn(process, 'exit').and.callFake(exitCode => {
      expect(exitCode).toEqual(1);
      expect(logger.error).toHaveBeenCalledWith(error);
      done();
    });

    mock.reRequire('../cli/e2e')('e2e', ARGV, SKY_PAGES_CONFIG, WEBPACK);
  });

  it('should catch protractor\'s selenium failures', (done) => {

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

    mock.reRequire('../cli/e2e')('e2e', ARGV, SKY_PAGES_CONFIG, WEBPACK);
  });

  function webdriverManagerUpdate(version, expected, done) {

    mock(configPath, {
      config: { }
    });

    mock('../cli/utils/run-build', () => new Promise(resolve => {
      resolve({
        toJson: () => {
          return {
            chunks: CHUNKS
          }
        }
      });
    }));

    mock('chromedriver-version-matcher', {
      getChromeDriverVersion: () => {
        if (version === undefined) {
          return Promise.reject();
        } else {
          return Promise.resolve({
            chromeDriverVersion: version
          });
        }
      }
    });

    const spyCrossSpawnSync = jasmine.createSpy('sync').and.callFake(() => ({ error: '' }));
    mock('cross-spawn', {
      sync: spyCrossSpawnSync
    });

    spyOn(fs, 'existsSync').and.returnValue(true);

    mock.reRequire('../cli/e2e')(
      'e2e',
      ARGV,
      SKY_PAGES_CONFIG,
      WEBPACK
    );

    spyOn(process, 'exit').and.callFake(() => {
      expect(spyCrossSpawnSync.calls.argsFor(0)[1]).toEqual([
        'update',
        '--standalone',
        'false',
        '--gecko',
        'false',
        '--versions.chrome',
        expected
      ]);
      done();
    });
  }

  it('should run webdriver-manager update command with the required version', (done) => {
    webdriverManagerUpdate('123', '123', done);
  });

  it('should run webdriver-manager update command with latest if no version found', (done) => {
    webdriverManagerUpdate('', 'latest', done);
  });

  it('should run webdriver-manager update command with latest if finding version fails', (done) => {
    webdriverManagerUpdate(undefined, 'latest', done);
  });

  it('should not continue if no e2e spec files exist', (done) => {
    mock('glob', {
      sync: path => []
    });

    spyOn(process, 'exit').and.callFake(exitCode => {
      expect(exitCode).toEqual(0);
      expect(logger.info).toHaveBeenCalledWith('No spec files located. Skipping e2e command.');
      done();
    });

    mock.reRequire('../cli/e2e')('e2e', ARGV, SKY_PAGES_CONFIG, WEBPACK);
  });

  it('should accept the --no-build flag and handle errors', (done) => {

    spyOn(fs, 'existsSync').and.returnValue(false);

    mock.reRequire('../cli/e2e')('e2e', { build: false }, SKY_PAGES_CONFIG, WEBPACK);
    spyOn(process, 'exit').and.callFake(() => {
      const calls = logger.info.calls.allArgs();
      const message = `Unable to skip build step.  "dist/metadata.json" not found.`;
      expect(calls).toContain([message]);
      done();
    });

  });

  it('should accept the --no-build flag and handle errors', (done) => {
    const metadata = [{ name: 'file1.js' }];

    spyOn(fs, 'existsSync').and.returnValue(true);
    const fsSpy = spyOn(fs, 'readJsonSync').and.returnValue(metadata);

    mock.reRequire('../cli/e2e')('e2e', { build: false }, SKY_PAGES_CONFIG, WEBPACK);
    spyOn(process, 'exit').and.callFake(exitCode => {
      expect(fsSpy).toHaveBeenCalledWith('dist/metadata.json');
      expect(PROTRACTOR_CONFIG_ARGS.params.chunks).toEqual({
        metadata: metadata
      });
      expect(exitCode).toBe(0);
      done();
    });
  });

  it('should pass chunks from the build stats to selenium', (done) => {
    mock.reRequire('../cli/e2e')('e2e', ARGV, SKY_PAGES_CONFIG, WEBPACK);
    spyOn(process, 'exit').and.callFake(exitCode => {
      expect(PROTRACTOR_CONFIG_ARGS.params.chunks).toEqual(CHUNKS);
      done();
    });
  });
});
