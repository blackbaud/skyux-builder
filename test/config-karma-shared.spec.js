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

  describe('code coverage', () => {
    let errorSpy;
    let exitSpy;
    let infoSpy;

    const coverageProps = [
      'statements',
      'branches',
      'lines',
      'functions'
    ];

    beforeEach(() => {
      mock(testConfigFilename, {
        getWebpackConfig: () => {}
      });

      errorSpy = jasmine.createSpy('error');
      infoSpy = jasmine.createSpy('info');

      exitSpy = spyOn(process, 'exit');

      mock('@blackbaud/skyux-logger', {
        error: errorSpy,
        info: infoSpy
      });

      mock('remap-istanbul', {
        remap: () => {
          return {
            fileCoverageFor: () => { },
            files: () => [
              'test.js'
            ]
          };
        }
      });
    });

    function createMergeSummaryObjectSpy(testPct) {
      return jasmine.createSpy('mergeSummaryObjects').and.callFake(() => {
        const summary = {};

        coverageProps.forEach((key) => {
          summary[key] = {
            pct: testPct
          };
        });

        return summary;
      });
    }

    function mockIstanbul(mergeSummaryObjects) {
      mock('istanbul', {
        utils: {
          summarizeFileCoverage: () => {},
          mergeSummaryObjects
        }
      });
    }

    function mockConfig(codeCoverageThreshold) {
      mock('../config/sky-pages/sky-pages.config.js', {
        getSkyPagesConfig: () => ({
          skyux: {
            codeCoverageThreshold
          }
        })
      });
    }

    function resetSpies() {
      errorSpy.calls.reset();
      infoSpy.calls.reset();
      exitSpy.calls.reset();
    }

    function checkCodeCoverage(thresholdName, threshold, testPct) {
      const mergeSummaryObjectsSpy = createMergeSummaryObjectSpy(testPct);

      mockIstanbul(mergeSummaryObjectsSpy);
      mockConfig(thresholdName);

      resetSpies();

      mock.reRequire('../config/karma/shared.karma.conf')({
        set: (config) => {
          const fakeCollector = {
            getFinalCoverage: () => {
              return {
                files: () => []
              };
            }
          };

          // Simulate multiple reporters and verify that the merged coverage summary
          // is only created once.
          config.coverageReporter._onWriteReport(fakeCollector);
          config.coverageReporter._onWriteReport(fakeCollector);

          expect(mergeSummaryObjectsSpy).toHaveBeenCalledTimes(1);

          // Verify the tests pass or fail based on the coverage percentage.
          config.coverageReporter._onExit(() => {});

          if (testPct < threshold) {
            expect(exitSpy).toHaveBeenCalledWith(1);

            coverageProps.forEach((key) => {
              expect(errorSpy).toHaveBeenCalledWith(
                `Coverage for ${key} (${testPct}%) does not meet global threshold (${threshold}%)`
              );
            });

            expect(infoSpy).toHaveBeenCalledWith('Karma has exited with 1.');
          } else {
            expect(exitSpy).not.toHaveBeenCalled();
            expect(errorSpy).not.toHaveBeenCalled();
            expect(infoSpy).not.toHaveBeenCalledWith('Karma has exited with 1.');
          }
        }
      });
    }

    it('should handle codeCoverageThreshold set to "none"', () => {
      checkCodeCoverage('none', 0, 0);
      checkCodeCoverage('none', 0, 1);
    });

    it('should handle codeCoverageThreshold set to "standard"', () => {
      checkCodeCoverage('standard', 80, 79);
      checkCodeCoverage('standard', 80, 80);
      checkCodeCoverage('standard', 80, 81);
    });

    it('should handle codeCoverageThreshold set to "strict"', () => {
      checkCodeCoverage('strict', 100, 99);
      checkCodeCoverage('strict', 100, 100);
    });
  });

});
