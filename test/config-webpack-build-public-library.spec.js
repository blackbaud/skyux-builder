/*jshint jasmine: true, node: true */
'use strict';

const runtimeUtils = require('../utils/runtime-test-utils');

describe('config webpack build public library', () => {
  const configPath = '../config/webpack/build-public-library.webpack.config';
  let skyPagesConfig;

  beforeEach(() => {
    skyPagesConfig = {
      skyux: {
        mode: 'advanced'
      },
      runtime: runtimeUtils.getDefaultRuntime()
    };
  });

  it('should expose a getWebpackConfig method', () => {
    const lib = require(configPath);
    expect(typeof lib.getWebpackConfig).toEqual('function');
  });

  it('should return a config object', () => {
    const lib = require(configPath);
    const config = lib.getWebpackConfig(skyPagesConfig);
    expect(config).toEqual(jasmine.any(Object));
  });

  it('should use the name from skyuxconfig for the name of the module', () => {
    skyPagesConfig.skyux.name = 'sample-app';
    const lib = require(configPath);
    const config = lib.getWebpackConfig(skyPagesConfig);
    expect(config.output.library).toBe('sample-app');
  });

  it('should use a default name if it is not set in skyuxconfig', () => {
    const lib = require(configPath);
    const config = lib.getWebpackConfig(skyPagesConfig);
    expect(config.output.library).toBe('SkyAppLibrary');
  });
});
