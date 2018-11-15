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
      set: () => {
        expect(called).toEqual(true);
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

    function checkCodeCoverage(thresholdName, threshold, testPct, shouldPass) {
      const mergeSummaryObjectsSpy = createMergeSummaryObjectSpy(testPct);

      mockIstanbul(mergeSummaryObjectsSpy);
      mockConfig(thresholdName);

      resetSpies();

      const browsers = ['Chrome', 'Firefox'];
      const reporters = [
        { type: 'json' },
        { type: 'html' }
      ];

      mock.reRequire('../config/karma/shared.karma.conf')({
        browsers: browsers,
        set: (config) => {
          config.coverageReporter.reporters = reporters;

          const fakeCollector = {
            getFinalCoverage: () => {
              return {
                files: () => []
              };
            }
          };

          // Simulate multiple reporters/browsers the same way that karma-coverage does.
          reporters.forEach(() => {
            browsers.forEach(() => {
              config.coverageReporter._onWriteReport(fakeCollector);
            });
          });

          // Code coverage should be evaluated once per browser unless the threshold is 0,
          // in which case it should not be called at all.
          expect(mergeSummaryObjectsSpy).toHaveBeenCalledTimes(
            threshold === 0 ? 0 : browsers.length
          );

          // Verify the tests pass or fail based on the coverage percentage.
          const doneSpy = jasmine.createSpy('done');

          config.coverageReporter._onExit(doneSpy);

          if (shouldPass) {
            expect(exitSpy).not.toHaveBeenCalled();
            expect(errorSpy).not.toHaveBeenCalled();
            expect(infoSpy).not.toHaveBeenCalledWith('Karma has exited with 1.');
          } else {
            expect(exitSpy).toHaveBeenCalledWith(1);

            browsers.forEach((browserName) => {
              coverageProps.forEach((key) => {
                expect(errorSpy).toHaveBeenCalledWith(
                  `Coverage in ${browserName} for ${key} (${testPct}%) does not meet ` +
                  `global threshold (${threshold}%)`
                );
              });
            })

            expect(infoSpy).toHaveBeenCalledWith('Karma has exited with 1.');
          }

          expect(doneSpy).toHaveBeenCalled();
        }
      });
    }

    it('should handle codeCoverageThreshold set to "none"', () => {
      checkCodeCoverage('none', 0, 0, true);
      checkCodeCoverage('none', 0, 1, true);
    });

    it('should handle codeCoverageThreshold set to "standard"', () => {
      checkCodeCoverage('standard', 80, 79, false);
      checkCodeCoverage('standard', 80, 80, true);
      checkCodeCoverage('standard', 80, 81, true);
    });

    it('should handle codeCoverageThreshold set to "strict"', () => {
      checkCodeCoverage('strict', 100, 99, false);
      checkCodeCoverage('strict', 100, 100, true);
    });
  });

});
