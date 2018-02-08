/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');

describe('logger', () => {
  afterEach(() => {
    mock.stopAll();
  });

  function setupTest(argv) {
    let _transports;
    let _colorize = false;

    mock('minimist', () => argv);
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

    mock.reRequire('../utils/logger');
    expect(_transports).toBeDefined();

    return _colorize;
  }

  it('should set the default color to true', () => {
    const colorize = setupTest({});
    expect(colorize).toEqual(true);
  });

  it('should accept the color flag', () => {
    const colorize = setupTest({ color: false });
    expect(colorize).toEqual(false);
  });
});
