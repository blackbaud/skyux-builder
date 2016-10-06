/*jshint jasmine: true, node: true */
'use strict';

describe('config webpack common', () => {
  it('should expose a getWebpackConfig method', () => {
    const lib = require('../config/webpack/common.webpack.config');
    expect(typeof lib.getWebpackConfig).toEqual('function');
  });
});
