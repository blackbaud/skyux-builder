/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');

describe('cli visual', () => {
  let mockStartE2E;

  beforeEach(() => {
    mockStartE2E = {
      start() {}
    };

    mock('../cli/utils/start-e2e', mockStartE2E);
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should pass arguments to start-e2e method', () => {
    const SKY_PAGES_CONFIG = {};
    const ARGV = { a: true };
    const WEBPACK = { c: true };

    const spy = spyOn(mockStartE2E, 'start').and.callThrough();

    mock.reRequire('../cli/visual')('visual', ARGV, SKY_PAGES_CONFIG, WEBPACK);
    expect(spy).toHaveBeenCalledWith('visual', ARGV, SKY_PAGES_CONFIG, WEBPACK);
  });
});
