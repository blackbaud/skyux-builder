/*jshint jasmine: true, node: true */
'use strict';

const runtimeUtils = require('../utils/runtime-test-utils');

describe('config webpack common', () => {
  let argv;
  let skyPagesConfig;

  beforeEach(() => {
    argv = {
      coverage: 'true'
    };
    skyPagesConfig = {
      skyux: {
        mode: 'advanced'
      },
      runtime: runtimeUtils.getDefaultRuntime()
    };
  });

  it('should expose a getWebpackConfig method', () => {
    const lib = require('../config/webpack/test.webpack.config');
    expect(typeof lib.getWebpackConfig).toEqual('function');
  });

  it('should return a config object', () => {
    const lib = require('../config/webpack/test.webpack.config');
    const config = lib.getWebpackConfig(argv, skyPagesConfig);
    expect(config).toEqual(jasmine.any(Object));
  });

  it('should not run coverage if argv.coverage is false', () => {
    argv.coverage = 'false';
    const lib = require('../config/webpack/test.webpack.config');
    const config = lib.getWebpackConfig(argv, skyPagesConfig);

    let instrumentLoader = config.module.rules.filter(rule => {
      return (rule.use && rule.use[0].loader === 'istanbul-instrumenter-loader');
    })[0];

    expect(instrumentLoader).not.toBeDefined();
  });
});
