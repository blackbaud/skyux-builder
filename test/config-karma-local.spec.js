/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');

describe('config karma local', () => {
  it('should load the shared config', (done) => {

    const path = '../config/karma/shared.karma.conf';
    let called = false;
    mock(path, () => {
      called = true;
    });

    require('../config/karma/local.karma.conf')({
      set: (config) => {
        expect(config.browsers).toBeDefined();
        expect(called).toEqual(true);
        mock.stop(path);
        done();
      }
    });

  });
});
