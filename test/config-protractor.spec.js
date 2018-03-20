/*jshint jasmine: true, node: true */
'use strict';

describe('config protractor test', () => {

  const mock = require('mock-require');

  let lib;
  let config;

  beforeEach(() => {
    lib = mock.reRequire('../config/protractor/protractor.conf.js');
    config = lib.config;
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should return a config object', () => {
    expect(lib.config).toBeDefined();
  });

  it('should provide a method for beforeLaunch', () => {
    let called = false;
    mock('ts-node', {
      register: () => {
        called = true;
      }
    });

    expect(config.beforeLaunch).toBeDefined();
    config.beforeLaunch();
    expect(called).toBe(true);
  });

  it('should provide a method for onPrepare', () => {
    let called = false;
    spyOn(jasmine, 'getEnv').and.returnValue({
      addReporter: () => {
        called = true;
      }
    });

    config.onPrepare();
    expect(jasmine.getEnv).toHaveBeenCalled();
    expect(called).toEqual(true);
  });

  it('should pass the logColor flag to the config', () => {
    mock('@blackbaud/skyux-logger', { logColor: false });
    const lib = mock.reRequire('../config/protractor/protractor.conf.js');
    expect(lib.config.jasmineNodeOpts.showColors).toBe(false);
  });
});
