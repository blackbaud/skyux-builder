/*jshint jasmine: true, node: true */
'use strict';

const path = require('path');
const runtimeUtils = require('../utils/runtime-test-utils');

describe('config webpack test', () => {
  let skyPagesConfig;

  beforeEach(() => {
    skyPagesConfig = {
      skyux: {
        mode: 'advanced'
      },
      runtime: runtimeUtils.getDefaultRuntime()
    };
  });

  function getLib() {
    return require('../config/webpack/test.webpack.config');
  }

  function getConfig(argv) {
    return getLib().getWebpackConfig(skyPagesConfig, argv);
  }

  function getInstrumentLoader(argv) {
    const config = getConfig(argv);

    return config.module.rules.filter(rule => {
      return (rule.use && rule.use[0].loader === 'istanbul-instrumenter-loader');
    })[0];
  }

  it('should expose a getWebpackConfig method', () => {
    const lib = getLib();
    expect(typeof lib.getWebpackConfig).toEqual('function');
  });

  it('should return a config object', () => {
    const config = getConfig();
    expect(config).toEqual(jasmine.any(Object));
  });

  it('should run coverage by default', () => {
    const instrumentLoader = getInstrumentLoader();

    expect(instrumentLoader).toBeDefined();
  });

  it('should not run coverage if argv.coverage is false', () => {
    const instrumentLoader = getInstrumentLoader({
      coverage: false
    });

    expect(instrumentLoader).not.toBeDefined();
  });

  it('should match on whole folder names when excluding folders from code coverage', () => {
    function createTestPaths(items) {
      return [
        ...items,
        // Add backslash variants of all provided paths.
        ...items.map(item => item.replace(/\//g, '\\'))
      ];
    }

    const instrumentLoader = getInstrumentLoader();

    const allowedPaths = createTestPaths([
      '/home/not_node_modules/some-folder/test.ts',
      '/home/skyux-spa-testing/src/test.ts',
      '/src/app/do-not-exclude-this-fixtures-folder/test.ts',
      '/src/app/do-not-exclude-this-testing-folder/test.ts',
      '/src/app/libs/test.ts',
      '/src/app/some-other-index.ts'
    ]);

    const disallowedPaths = createTestPaths([
      '/home/node_modules/some-folder/test.ts',
      '/home/testing/src/test.ts',
      '/src/app/fixtures/test.ts',
      '/src/app/testing/test.ts',
      '/src/app/lib/test.ts',
      '/src/app/index.ts'
    ]);

    for (const allowedPath of allowedPaths) {
      let foundMatch;

      for (const exclude of instrumentLoader.exclude) {
        foundMatch = foundMatch || exclude.test(allowedPath);
      }

      expect(foundMatch).toBe(false);
    }

    for (const disallowedPath of disallowedPaths) {
      let foundMatch;

      for (const exclude of instrumentLoader.exclude) {
        foundMatch = foundMatch || exclude.test(disallowedPath);
      }

      expect(foundMatch).toBe(true);
    }
  });

  it('should run coverage differently for libraries', () => {
    let instrumentLoader = getInstrumentLoader();
    let index = instrumentLoader.include.indexOf(path.resolve('src', 'app'));

    expect(index > -1).toEqual(true);

    instrumentLoader = getInstrumentLoader({
      coverage: 'library'
    });

    index = instrumentLoader.include.indexOf(path.resolve('src', 'app', 'public'));
    expect(index > -1).toEqual(true);
  });
});
