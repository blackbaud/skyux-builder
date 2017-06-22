/*jshint jasmine: true, node: true */
'use strict';

describe('config webpack release', () => {
  beforeEach(() => {});

  it('should expose a getWebpackConfig method', () => {
    const lib = require('../config/webpack/release.webpack.config');
    expect(typeof lib.getWebpackConfig).toEqual('function');
  });
});
