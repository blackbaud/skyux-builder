/*jshint jasmine: true, node: true */
'use strict';

describe('config webpack serve', () => {
  it('should expose a getWebpackConfig method', () => {
    const lib = require('../config/webpack/serve.webpack.config');
    expect(typeof lib.getWebpackConfig).toEqual('function');
  });
});
