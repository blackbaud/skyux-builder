/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');

describe('logger', () => {
  afterEach(() => {
    mock.stopAll();
  });

  it('should configure a custom transport', () => {
    let _transports;
    let _colorize = false;
    mock('winston', {
      Logger: function (opts) {
        _transports = opts.transports;
      },
      transports: {
        Console: function (opts) {
          _colorize = opts.colorize;
        }
      }
    });

    const logger = mock.reRequire('../utils/logger');
    expect(_colorize).toEqual(true);
    expect(_transports).toBeDefined();
  });
});
