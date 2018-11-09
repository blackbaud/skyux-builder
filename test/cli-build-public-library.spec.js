/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const rimraf = require('rimraf');
const logger = require('@blackbaud/skyux-logger');
const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');

describe('cli build-public-library', () => {
  const requirePath = '../cli/build-public-library';
  let webpackConfig;
  let mockWebpack;
  let mockFs;
  let mockSpawn;
  let mockPluginFileProcessor;

  beforeEach(() => {
    mockFs = {
      writeJSONSync() {},
      writeFileSync() {},
      copySync() {},
      existsSync() {}
    };

    mockSpawn = {
      sync() {
        return {
          status: 0
        };
      }
    };

    mockWebpack = () => {
      return {
        run: (cb) => {
          cb(null, {
          toJson: () => ({
            errors: [],
            warnings: []
          })
        });
        }
      };
    };

    mockPluginFileProcessor = {
      processFiles: () => {}
    };

    mock('../cli/utils/ts-linter', {
      lintSync: () => {
        return {
          exitCode: 0
        };
      }
    });
    mock('../cli/utils/stage-library-ts', () => {});
    mock('../cli/utils/prepare-library-package', () => {});
    mock('../config/webpack/build-public-library.webpack.config.js', {
      getWebpackConfig: () => {
        webpackConfig = {
          entry: ''
        };
        return webpackConfig;
      }
    });

    mock('../lib/plugin-file-processor', mockPluginFileProcessor);
    mock('fs-extra', mockFs);
    mock('cross-spawn', mockSpawn);

    spyOn(process, 'exit').and.callFake(() => {});
    spyOn(skyPagesConfigUtil, 'spaPath').and.returnValue('');
    spyOn(skyPagesConfigUtil, 'spaPathTemp').and.callFake((...fragments) => {
      return fragments.join('/');
    });
    spyOn(skyPagesConfigUtil, 'outPath').and.callFake((fileName = '') => {
      return fileName;
    });
    spyOn(rimraf, 'sync').and.callFake(() => {});
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should return a function', () => {
    const cliCommand = mock.reRequire(requirePath);
    expect(cliCommand).toEqual(jasmine.any(Function));
  });

  it('should copy the runtime folder before compiling then clean it before packaging', (done) => {
    const cliCommand = mock.reRequire(requirePath);
    const spy = spyOn(mockFs, 'copySync').and.callThrough();
    cliCommand({}, mockWebpack).then(() => {
      expect(spy).toHaveBeenCalledWith('runtime', 'runtime');
      expect(rimraf.sync).toHaveBeenCalledTimes(4);
      done();
    });
  });

  it('should clean the dist and temp directories', (done) => {
    const cliCommand = mock.reRequire(requirePath);
    cliCommand({}, mockWebpack).then(() => {
      expect(rimraf.sync).toHaveBeenCalled();
      expect(skyPagesConfigUtil.spaPathTemp).toHaveBeenCalled();
      expect(skyPagesConfigUtil.spaPath).toHaveBeenCalledWith('dist');
      done();
    });
  });

  it('should write a tsconfig.json file', (done) => {
    const cliCommand = mock.reRequire(requirePath);
    const spy = spyOn(mockFs, 'writeJSONSync').and.callThrough();
    cliCommand({}, mockWebpack).then(() => {
      const firstArg = spy.calls.argsFor(0)[0];
      expect(firstArg).toEqual('tsconfig.json');
      done();
    });
  });

  it('should write a placeholder module file', (done) => {
    const cliCommand = mock.reRequire(requirePath);
    const spy = spyOn(mockFs, 'writeFileSync').and.callThrough();
    cliCommand({}, mockWebpack).then(() => {
      const args = spy.calls.argsFor(0);
      expect(args[0]).toEqual('main.ts');
      expect(args[1]).toEqual(`import { NgModule } from '@angular/core';
export * from './index';
@NgModule({})
export class SkyLibPlaceholderModule {}
`);
      done();
    });
  });

  it('should pass config to webpack', (done) => {
    const cliCommand = mock.reRequire(requirePath);
    cliCommand({}, mockWebpack).then(() => {
      expect(webpackConfig).toEqual(jasmine.any(Object));
      expect(webpackConfig.entry).toEqual(jasmine.any(String));
      done();
    });
  });

  it('should handle errors thrown by webpack', (done) => {
    const errorMessage = 'Something bad happened.';
    spyOn(logger, 'error').and.returnValue();
    mockWebpack = () => {
      return {
        run: (cb) => cb(errorMessage)
      };
    };
    const cliCommand = mock.reRequire(requirePath);
    cliCommand({}, mockWebpack).then(() => {
      expect(logger.error).toHaveBeenCalledWith(errorMessage);
      done();
    });
  });

  it('should fail the build if linting errors are found', (done) => {
    mock.stop('../cli/utils/ts-linter');
    mock('../cli/utils/ts-linter', {
      lintSync: () => {
        return {
          exitCode: 1
        };
      }
    });
    const cliCommand = mock.reRequire(requirePath);
    cliCommand({}, mockWebpack).then(() => {
      expect(process.exit).toHaveBeenCalledWith(1);
      done();
    });
  });

  it('should handle transpilation errors', (done) => {
    const cliCommand = mock.reRequire(requirePath);
    const spy = spyOn(logger, 'error');
    spyOn(mockSpawn, 'sync').and.returnValue({
      err: 'something bad happened'
    });
    cliCommand({}, mockWebpack).then(() => {
      expect(spy).toHaveBeenCalledWith('something bad happened');
      done();
    });
  });

  it('should catch non-zero status codes during transpilation', (done) => {
    const cliCommand = mock.reRequire(requirePath);
    const spy = spyOn(logger, 'error').and.returnValue();
    spyOn(mockSpawn, 'sync').and.returnValue({
      err: null,
      status: 1
    });
    cliCommand({}, mockWebpack).then(() => {
      expect(spy).toHaveBeenCalledWith(
        new Error(`Angular compiler (ngc) exited with status code 1.`)
      );
      done();
    });
  });

  it('should process files', (done) => {
    const cliCommand = mock.reRequire(requirePath);
    const spy = spyOn(mockPluginFileProcessor, 'processFiles').and.callThrough();

    cliCommand({}, mockWebpack).then(() => {
      expect(spy).toHaveBeenCalled();
      done();
    });
  });

  it('should include testing entry point if directory exists', (done) => {
    spyOn(mockFs, 'existsSync').and.returnValue(true);
    const spy = spyOn(mockFs, 'writeJSONSync').and.callThrough();
    const cliCommand = mock.reRequire(requirePath);
    cliCommand({}, mockWebpack).then(() => {
      expect(spy).toHaveBeenCalled();
      const files = spy.calls.argsFor(0)[1].files;
      expect(files[1]).toEqual('testing/index.ts');
      done();
    });
  });
});
