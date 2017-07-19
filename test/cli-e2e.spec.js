/*jshint jasmine: true, node: true */
'use strict';

const path = require('path');
const mock = require('mock-require');
const logger = require('winston');
const selenium = require('selenium-standalone');

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

  beforeEach(() => {
    EXIT_CODE = 0;

    mock('../cli/build', () => {
      return new Promise(resolve => {
        resolve({
          toJson: () => ({
            chunks: CHUNKS
          })
        });
      });
    });

    mock('cross-spawn', {
      spawn: () => {
        return {
          on: (evt, cb) => {
            if (evt === 'exit') {
              PROTRACTOR_CB = cb;
              cb(EXIT_CODE);
            }
          }
        };
      },
      sync: () => {
        return { };
      }
    });

    mock('portfinder', {
      getPortPromise: () => new Promise(resolve => resolve(PORT))
    });

    mock('http-server', {
      createServer: () => ({
        close: () => {},
        listen: (port, host, cb) => {
          cb();
        }
      })
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
    require('../cli/e2e')(ARGV, SKY_PAGES_CONFIG, WEBPACK);
  });

  it('should catch protractor kitchen sink error', (done) => {
    spyOn(logger, 'warn');
    spyOn(process, 'exit').and.callFake(exitCode => {
      expect(logger.warn).toHaveBeenCalledWith('Supressing protractor\'s "kitchen sink" error 199');
      expect(exitCode).toEqual(0);
      done();
    });

    EXIT_CODE = 199;
    require('../cli/e2e')(ARGV, SKY_PAGES_CONFIG, WEBPACK);
  });

  it('should install and start selenium only if a seleniumAddress is specified', (done) => {
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

    require('../cli/e2e')(ARGV, SKY_PAGES_CONFIG, WEBPACK);
  });

  it('should only kill servers that exist', (done) => {
    let called = false;
    spyOn(logger, 'warn');
    spyOn(process, 'exit').and.callFake(() => {
      // Stop the infinite loop
      if (!called) {
        called = true;
        expect(infoCalledWith('Closing http server')).toEqual(true);
        logger.info.calls.reset();
        PROTRACTOR_CB();
        expect(infoCalledWith('Closing http server')).toEqual(false);
        done();
      }
    });

    require('../cli/e2e')(ARGV, SKY_PAGES_CONFIG, WEBPACK);
  });

  it('should catch build failures', (done) => {
    mock('../cli/build', () => Promise.reject(new Error('Build failed.')));

    spyOn(process, 'exit').and.callFake(exitCode => {
      expect(exitCode).toEqual(1);
      done();
    });

    mock.reRequire('../cli/e2e')(ARGV, SKY_PAGES_CONFIG, WEBPACK);
  });

  it('should catch http-server failures', (done) => {
    mock('http-server', {
      createServer: (opts) => ({
        close: () => {},
        listen: () => {
          // Log a message.
          opts.logFn.call({}, null, null, null);

          // Log an error.
          opts.logFn.call({}, null, null, new Error('Server failed.'));
        }
      })
    });

    spyOn(process, 'exit').and.callFake(exitCode => {
      expect(exitCode).toEqual(1);
      done();
    });

    mock.reRequire('../cli/e2e')(ARGV, SKY_PAGES_CONFIG, WEBPACK);
  });

  it('should catch portfinder failures', (done) => {
    mock('portfinder', {
      getPortPromise: () => Promise.reject(new Error('Portfinder failed.'))
    });

    spyOn(process, 'exit').and.callFake(exitCode => {
      expect(exitCode).toEqual(1);
      done();
    });

    mock.reRequire('../cli/e2e')(ARGV, SKY_PAGES_CONFIG, WEBPACK);
  });

  it('should catch selenium failures', (done) => {
    debugger;
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
});
