/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');

describe('cli test', () => {
  it('should spawn karma', () => {

    let called = false;
    mock('cross-spawn', () => {
      called = true;
    });

    require('../cli/test')({ _: ['test'] });
    expect(called).toEqual(true);
  });
});
