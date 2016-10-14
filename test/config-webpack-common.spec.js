/*jshint jasmine: true, node: true */
'use strict';

describe('config webpack common', () => {
  it('should expose a getWebpackConfig method', () => {
    const lib = require('../config/webpack/common.webpack.config');
    expect(typeof lib.getWebpackConfig).toEqual('function');
  });

  it('should handle an advanced mode', () => {
    const lib = require('../config/webpack/common.webpack.config');
    const config = lib.getWebpackConfig({
      'blackbaud-sky-pages-out-skyux2': {
        mode: 'advanced'
      }
    });
    expect(config.entry.app[0]).toContain(process.cwd());
  });
});
