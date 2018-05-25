/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');

const runtimeUtils = require('../utils/runtime-test-utils');

describe('config webpack build public library', () => {
  const configPath = '../config/webpack/build-public-library.webpack.config';

  let mockFs;
  let skyPagesConfig;

  beforeEach(() => {
    mockFs = {
      readJsonSync() {
        return {};
      }
    };

    skyPagesConfig = {
      skyux: {
        mode: 'advanced'
      },
      runtime: runtimeUtils.getDefaultRuntime()
    };

    mock('../config/sky-pages/sky-pages.config', {
      spaPathTemp() {},
      spaPath() {
        return 'spa';
      },
      outPath() {
        return 'out';
      }
    });

    mock('fs-extra', mockFs);
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should expose a getWebpackConfig method', () => {
    const lib = mock.reRequire(configPath);
    expect(typeof lib.getWebpackConfig).toEqual('function');
  });

  it('should return a config object', () => {
    const lib = mock.reRequire(configPath);
    const config = lib.getWebpackConfig(skyPagesConfig);
    expect(config).toEqual(jasmine.any(Object));
  });

  it('should use the name from skyuxconfig for the name of the module', () => {
    skyPagesConfig.skyux.name = 'sample-app';
    const lib = mock.reRequire(configPath);
    const config = lib.getWebpackConfig(skyPagesConfig);
    expect(config.output.library).toBe('sample-app');
  });

  it('should use a default name if it is not set in skyuxconfig', () => {
    const lib = mock.reRequire(configPath);
    const config = lib.getWebpackConfig(skyPagesConfig);
    expect(config.output.library).toBe('SkyAppLibrary');
  });

  it('should generate externals from builder and SPA dependencies', () => {
    spyOn(mockFs, 'readJsonSync').and.callFake((path) => {
      if (path === 'out') {
        return {
          dependencies: {
            '@angular/common': '4.3.6',
            '@pact-foundation/pact-web': '5.3.0',
            'zone.js': '0.8.10'
          }
        };
      }

      return {
        dependencies: {
          '@blackbaud/skyux': '2.13.0',
          '@blackbaud-internal/skyux-lib-testing': 'latest'
        }
      };
    });
    const lib = mock.reRequire(configPath);
    const config = lib.getWebpackConfig(skyPagesConfig);
    expect(config.externals).toEqual([
      /^@angular\/common/,
      /^@pact\-foundation\/pact\-web/,
      /^zone\.js/,
      /^@blackbaud\/skyux/,
      /^@blackbaud\-internal\/skyux\-lib\-testing/
    ]);
  });

  it('should handle externals if dependencies not defined', () => {
    const lib = mock.reRequire(configPath);
    const config = lib.getWebpackConfig(skyPagesConfig);
    expect(config.externals).toEqual([]);
  });
});
