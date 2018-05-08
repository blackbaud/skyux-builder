/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const logger = require('@blackbaud/skyux-logger');
const runtimeUtils = require('../utils/runtime-test-utils');

describe('cli utils run build', () => {
  let mockAssetsProcessor;
  let mockLocaleProcessor;

  beforeEach(() => {
    mockLocaleProcessor = {
      prepareLocaleFiles() {}
    };

    mockAssetsProcessor = {
      setSkyAssetsLoaderUrl() {},
      getAssetsUrl: () => '',
      processAssets: (content) => content
    };

    spyOn(process, 'exit').and.callFake(() => {});
    mock('../cli/utils/ts-linter', {
      lintSync: () => {
        return {
          exitCode: 0
        };
      }
    });
    mock('../lib/plugin-file-processor', {
      processFiles: () => {}
    });
    mock('../lib/locale-assets-processor', mockLocaleProcessor);
    mock('../lib/assets-processor', mockAssetsProcessor);
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should call getWebpackConfig', () => {
    let called = false;
    mock('../config/webpack/build.webpack.config', {
      getWebpackConfig: () => {
        called = true;
        return {};
      }
    });

    mock.reRequire('../cli/utils/run-build')({}, {}, () => ({
      run: () => {}
    }));
    expect(called).toEqual(true);
  });

  it('should call webpack and handle errors', (done) => {
    spyOn(logger, 'error');
    mock('../config/webpack/build.webpack.config', {
      getWebpackConfig: () => ({})
    });

    const customError = 'custom-error1';
    mock.reRequire('../cli/utils/run-build')({}, {}, () => ({
      run: (cb) => {
        cb(customError);
      }
    })).then(() => {}, (err) => {
      expect(err).toEqual(customError);
      done();
    });
  });

  it('should write files to disk in AoT compile mode', (done) => {
    const fs = require('fs-extra');
    const generator = require('../lib/sky-pages-module-generator');
    const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');

    const f = '../config/webpack/build-aot.webpack.config';

    mock(f, {
      getWebpackConfig: () => ({})
    });

    const writeJSONSpy = spyOn(fs, 'writeJSONSync');
    const copySpy = spyOn(fs, 'copySync');
    const writeFileSpy = spyOn(fs, 'writeFileSync');
    const removeSpy = spyOn(fs, 'removeSync');

    let passedConfig;
    spyOn(generator, 'getSource').and.callFake(function (c) {
      passedConfig = c;
      return 'TESTSOURCE';
    });

    mock.reRequire('../cli/utils/run-build')(
      {},
      {
        runtime: runtimeUtils.getDefaultRuntime(),
        skyux: {
          compileMode: 'aot'
        }
      },
      () => ({
        run: (cb) => {
          cb(
            null,
            {
              toJson: () => ({
                errors: [],
                warnings: []
              })
            }
          );
        }
      })
    ).then(() => {
      // The temp folder should be deleted after the build is complete.
      expect(removeSpy).toHaveBeenCalledWith(
        skyPagesConfigUtil.spaPathTemp()
      );
      expect(passedConfig.hasOwnProperty('skyuxPathAlias')).toBe(false);

      done();
    });

    // The default SKY UX Builder source files should be written first.
    expect(copySpy.calls.argsFor(1)).toEqual([
      skyPagesConfigUtil.outPath('src'),
      skyPagesConfigUtil.spaPathTempSrc()
    ]);

    // The SPA project's files should be written next, overwriting any
    // files from SKY UX Builder's default source.
    expect(copySpy.calls.argsFor(1)).toEqual([
      skyPagesConfigUtil.spaPath('src'),
      skyPagesConfigUtil.spaPathTempSrc()
    ]);

    // Ensure the SKY UX Builder module is written to disk.
    expect(writeFileSpy).toHaveBeenCalledWith(
      skyPagesConfigUtil.spaPathTempSrc('app', 'sky-pages.module.ts'),
      'TESTSOURCE',
      {
        encoding: 'utf8'
      }
    );

    // Ensure the TypeScript config file is written to disk.
    expect(writeJSONSpy).toHaveBeenCalledWith(
      skyPagesConfigUtil.spaPathTempSrc('tsconfig.json'),
      jasmine.objectContaining({
        'files': [
          './app/app.module.ts'
        ]
      })
    );

    mock.stop(f);
  });

  it('should allow the SKY UX import path to be overridden', (done) => {
    const generator = require('../lib/sky-pages-module-generator');

    const f = '../config/webpack/build-aot.webpack.config';

    mock(f, {
      getWebpackConfig: () => ({})
    });

    let calledConfig;

    spyOn(generator, 'getSource').and.callFake(function (c) {
      calledConfig = c;
      return 'TESTSOURCE';
    });

    mock.reRequire('../cli/utils/run-build')(
      {},
      {
        runtime: runtimeUtils.getDefaultRuntime(),
        skyux: {
          compileMode: 'aot',
          importPath: 'asdf'
        }
      },
      () => ({
        run: (cb) => {
          cb(
            null,
            {
              toJson: () => ({
                errors: [],
                warnings: []
              })
            }
          );

          // The default SKY UX Builder source files should be written first.
          expect(calledConfig.runtime.skyuxPathAlias).toEqual('../../asdf');

          mock.stop(f);
          done();
        }
      })
    );

  });

  it('should allow the assets base URL to be specified', (done) => {
    const f = '../config/webpack/build-aot.webpack.config';

    mock(f, {
      getWebpackConfig: () => ({})
    });

    const setSkyAssetsLoaderUrlSpy = spyOn(mockAssetsProcessor, 'setSkyAssetsLoaderUrl');

    mock.reRequire('../cli/utils/run-build')(
      {
        assets: 'https://example.com/'
      },
      {
        runtime: runtimeUtils.getDefaultRuntime(),
        skyux: {
          compileMode: 'aot',
          importPath: 'asdf'
        }
      },
      () => ({
        run: (cb) => {
          try {
            cb(
              null,
              {
                toJson: () => ({
                  errors: [],
                  warnings: []
                })
              }
            );

            expect(setSkyAssetsLoaderUrlSpy).toHaveBeenCalledWith(
              jasmine.any(Object),
              jasmine.any(Object),
              'https://example.com/',
              undefined
            );
          } finally {
            mock.stop(f);
            done();
          }
        }
      })
    );

  });

  it('should fail the build if linting errors are found', (done) => {
    mock.stop('../cli/utils/ts-linter');

    const errors = 'Custom Linting Error';
    mock('../cli/utils/ts-linter', {
      lintSync: () => {
        return {
          exitCode: 1,
          errors
        };
      }
    });
    mock.reRequire('../cli/utils/run-build')({}, {
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: {}
    }).catch(err => {
      expect(err).toBe(errors);
      done();
    });
  });

  it('should serve and browse to the built files if serve flag is present', (done) => {
    const port = 1234;

    mock('../cli/utils/server', {
      start: () => Promise.resolve(port)
    });

    mock('../cli/utils/browser', (argv, c, s, p) => {
      expect(argv.serve).toBe(true);
      expect(p).toBe(port);
      done();
    });

    mock.reRequire('../cli/utils/run-build')({ serve: true }, runtimeUtils.getDefault(), () => ({
      run: (cb) => {
        cb(
          null,
          {
            toJson: () => ({
              errors: [],
              warnings: []
            })
          }
        );
      }
    }));
  });

  it('should call prepareLocaleFiles()', () => {
    const spy = spyOn(mockLocaleProcessor, 'prepareLocaleFiles').and.callThrough();

    mock('../config/webpack/build.webpack.config', {
      getWebpackConfig: () => ({})
    });

    mock.reRequire('../cli/utils/run-build')({}, {}, () => ({
      run: () => {}
    }));
    expect(spy).toHaveBeenCalledWith();
  });
});
