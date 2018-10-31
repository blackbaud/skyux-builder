/*jshint jasmine: true, node: true */
'use strict';

const path = require('path');
const mock = require('mock-require');

describe('config karma shared', () => {

  const testConfigFilename = '../config/webpack/test.webpack.config';

  afterAll(() => {
    mock.stopAll();
  });

  it('should load the webpack config', (done) => {
    let called = false;
    mock(testConfigFilename, {
      getWebpackConfig: () => {
        called = true;
        return {};
      }
    });

    mock.reRequire('../config/karma/shared.karma.conf')({
      set: (config) => {
        const collector = {
          getFinalCoverage: () => ({})
        };
        expect(called).toEqual(true);
        expect(typeof config.coverageReporter._onWriteReport).toEqual('function');
        expect(config.coverageReporter._onWriteReport(collector)).toBeDefined();
        done();
      }
    });
  });

  it('should pass the right command name to skyPagesConfig', (done) => {

    const customCommand = 'custom-command';
    spyOn(process.argv, 'slice').and.returnValue([customCommand]);

    mock(testConfigFilename, {
      getWebpackConfig: () => {}
    });

    mock('../config/sky-pages/sky-pages.config.js', {
      getSkyPagesConfig: (command) => {
        expect(command).toBe(customCommand);
        done();

        return {
          skyux: {}
        };
      }
    });

    mock.reRequire('../config/karma/shared.karma.conf')({
      set: () => {}
    });
  });

  function checkCodeCoverage(configValue, threshold) {

    mock('../config/sky-pages/sky-pages.config.js', {
      getSkyPagesConfig: () => ({
        skyux: {
          codeCoverageThreshold: configValue
        }
      })
    });

    mock(testConfigFilename, {
      getWebpackConfig: () => {}
    });

    mock.reRequire('../config/karma/shared.karma.conf')({
      set: (config) => {
        expect(config.coverageReporter.check).toEqual({
          global: {
            statements: threshold,
            branches: threshold,
            functions: threshold,
            lines: threshold
          }
        });
      }
    });
  }

  it('should not add the check property when codeCoverageThreshold is not defined', () => {
    mock('../config/sky-pages/sky-pages.config.js', {
      getSkyPagesConfig: () => ({
        skyux: {}
      })
    });

    mock(testConfigFilename, {
      getWebpackConfig: () => {}
    });

    mock.reRequire('../config/karma/shared.karma.conf')({
      set: (config) => {
        expect(config.coverageReporter.check).toBeUndefined();
      }
    });
  });

  it('should handle codeCoverageThreshold set to "none"', () => {
    checkCodeCoverage('none', 0);
  });

  it('should handle codeCoverageThreshold set to "standard"', () => {
    checkCodeCoverage('standard', 80);
  });

  it('should handle codeCoverageThreshold set to "strict"', () => {
    checkCodeCoverage('strict', 100);
  });

  it('should pass the logColor flag to the config', () => {
    mock('@blackbaud/skyux-logger', { logColor: false });
    mock.reRequire('../config/karma/shared.karma.conf')({
      set: (config) => {
        expect(config.colors).toBe(false);
      }
    });
  });

  it('should ignore anything outside the src directory in webpackMiddleware', () => {
    mock('../config/sky-pages/sky-pages.config.js', {
      getSkyPagesConfig: () => ({
        skyux: {}
      })
    });

    mock(testConfigFilename, {
      getWebpackConfig: () => {}
    });

    spyOn(path, 'resolve').and.callThrough();

    mock.reRequire('../config/karma/shared.karma.conf')({
      set: (config) => {
        const filter = config.webpackMiddleware.watchOptions.ignored;
        expect(filter).toBeDefined();

        expect(path.resolve).toHaveBeenCalled();
        expect(filter(path.join(process.cwd(), 'src'))).toBe(false);
        expect(filter(path.join(process.cwd(), 'node_modules'))).toBe(true);
        expect(filter(path.join(process.cwd(), '.skypageslocales'))).toBe(true);
        expect(filter(path.join(process.cwd(), 'coverage'))).toBe(true);
      }
    });
  });

});
