/*jshint jasmine: true, node: true */
'use strict';

describe('config protractor test', () => {

  const mock = require('mock-require');
  const proxyquire = require('proxyquire');

  let lib;
  let config;

  beforeEach(() => {
    lib = require('../config/protractor/protractor.conf.js');
    config = lib.config;
  });

  it('should return a config object', () => {
    expect(lib.config).toBeDefined();
  });

  it('sholud provide a method for beforeLaunch', () => {
    let called = false;
    mock('ts-node', {
      register: () => {
        called = true;
      }
    });

    expect(config.beforeLaunch).toBeDefined();
    config.beforeLaunch();
    expect(called).toBe(true);
    mock.stop('ts-node');

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
});
