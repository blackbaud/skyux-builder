/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');

describe('config webpack build', () => {
  it('should expose a getWebpackConfig method', () => {
    const lib = require('../config/webpack/build.webpack.config');
    expect(typeof lib.getWebpackConfig).toEqual('function');
  });

  it('should merge the common webpack config with overrides', () => {
    mock('./common.webpack.config', {
      getWebpackConfig: () => ({})
    });

    const lib = require('../config/webpack/build.webpack.config');
    const config = lib.getWebpackConfig({
      CUSTOM_PROP2: true,
      'blackbaud-sky-pages-out-skyux2': 'advanced'
    });
    expect(config.SKY_PAGES.CUSTOM_PROP2).toEqual(true);
  });

});
