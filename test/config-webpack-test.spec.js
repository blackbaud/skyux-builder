/*jshint jasmine: true, node: true */
'use strict';

describe('config webpack test', () => {
  it('should expose a getWebpackConfig method', () => {
    const lib = require('../config/webpack/test.webpack.config');
    expect(typeof lib.getWebpackConfig).toEqual('function');
  });
});
