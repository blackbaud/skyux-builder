/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');

describe('cli watch', () => {
  it('should spawn karma', () => {

    let called = false;
    mock('cross-spawn', () => {
      called = true;
    });

    require('../cli/watch')();
    expect(called).toEqual(true);
  });
});
