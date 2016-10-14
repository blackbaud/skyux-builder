/*jshint jasmine: true, node: true */
'use strict';

describe('config webpack common', () => {
  it('should expose a getWebpackConfig method', () => {
    const lib = require('../config/webpack/test.webpack.config');
    expect(typeof lib.getWebpackConfig).toEqual('function');
  });

  it('should return a config object', () => {
    const lib = require('../config/webpack/test.webpack.config');
    const config = lib.getWebpackConfig({
      'blackbaud-sky-pages-out-skyux2': {
        mode: 'advanced'
      }
    });
    expect(config).toEqual(jasmine.any(Object));
  });
});
