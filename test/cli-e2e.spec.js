/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs-extra');
const path = require('path');
const mock = require('mock-require');
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

  const updateConfigJson = {
    chrome: { last: 'last-chrome-driver' },
    gecko: { last: 'last-gecko-driver' }
  };

  const metadataJson = [{ name: 'file1.js' }];

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

    mock('webdriver-manager/built/lib/cmds/update', {
      program: {
        run: () => Promise.resolve(updateConfigJson)
      }
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

    mock('fs-extra', {
      existsSync: filename => {
        return true;
      },

      readJsonSync: filename => {
        if (filename.indexOf('metadata.json') > -1) {
          return metadataJson;
        } else if (filename.indexOf('update-config.json') > -1) {
          return updateConfigJson;
        }
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

    mock('webdriver-manager/built/lib/cmds/update', {
      program: {
        run: () => Promise.reject('custom-error')
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

  it('should accept the --no-build flag if errors', (done) => {
    mock.stop('fs-extra');
    mock('fs-extra', {
      existsSync: () => false
    });

    mock.reRequire('../cli/e2e')({ build: false }, SKY_PAGES_CONFIG, WEBPACK);
    spyOn(process, 'exit').and.callFake(() => {
      const calls = logger.info.calls.allArgs();
      const message = `Unable to skip build step.  "dist/metadata.json" not found.`;
      expect(calls).toContain([message]);
      done();
    });

  });

  it('should accept the --no-build flag if errors', (done) => {
    mock.reRequire('../cli/e2e')({ build: false }, SKY_PAGES_CONFIG, WEBPACK);
    spyOn(process, 'exit').and.callFake(exitCode => {
      expect(PROTRACTOR_CONFIG_ARGS.params.chunks).toEqual({
        metadata: metadataJson
      });
      expect(exitCode).toBe(0);
      done();
    });

  });
});
