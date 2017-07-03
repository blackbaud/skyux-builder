/*jshint jasmine: true, node: true */
'use strict';

describe('config webpack build public library', () => {
  beforeEach(() => {});

  it('should expose a getWebpackConfig method', () => {
    const lib = require('../config/webpack/build-public-library.webpack.config');
    expect(typeof lib.getWebpackConfig).toEqual('function');
  });
});
