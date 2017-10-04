/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const logger = require('../utils/logger');

describe('cli util ts-linter', () => {
  afterEach(() => {
    mock.stopAll();
  });

  it('should expose a lintSync method', () => {
    spyOn(logger, 'info').and.returnValue();
    mock('../config/sky-pages/sky-pages.config', {
      spaPath: (filePath) => filePath
    });
    const tsLinter = mock.reRequire('../cli/utils/ts-linter');
    expect(typeof tsLinter.lintSync).toEqual('function');
  });

  function setupMock(filenames, results) {
    function Linter() {
      return {
        lint: () => {},

        getResult: () => (results)
      };
    }

    Linter.createProgram = () => ({
      getSourceFile: () => ({
        getFullText: () => {}
      })
    });

    Linter.getFileNames = () => (filenames);

    mock('tslint', {
      Configuration: {
        loadConfigurationFromPath: () => {}
      },
      Linter: Linter
    });

    const tsLinter = mock.reRequire('../cli/utils/ts-linter');
    return tsLinter.lintSync();
  }

  it('should run tslint', () => {

    spyOn(logger, 'info').and.returnValue();

    mock('../config/sky-pages/sky-pages.config', {
      spaPath: (filePath) => filePath
    });

    const result = setupMock([], {});

    expect(logger.info).toHaveBeenCalledWith(`TSLint finished with 0 errors.`);
    expect(result.errors).toEqual([]);
    expect(result.exitCode).toEqual(0);
  });

  it('should log tslint errors', () => {
    spyOn(logger, 'error');
    spyOn(logger, 'info');

    mock('../config/sky-pages/sky-pages.config', {
      spaPath: (filePath) => filePath
    });

    const result = setupMock(['test-file'], {
      errorCount: 1,
      output: 'custom-error'
    });

    expect(logger.error).toHaveBeenCalledWith('custom-error');
    expect(logger.info).toHaveBeenCalledWith(`TSLint finished with 1 error.`);
    expect(result.errors).toEqual(['custom-error']);
    expect(result.exitCode).toEqual(1);
  });

  it('should not log if no tslint', () => {
    spyOn(logger, 'error');
    spyOn(logger, 'info');

    mock('../config/sky-pages/sky-pages.config', {
      spaPath: (filePath) => filePath
    });

    const result = setupMock(['test-file'], {
      errorCount: 0,
      output: ''
    });

    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(`TSLint finished with 0 errors.`);
    expect(result.errors).toEqual([]);
    expect(result.exitCode).toEqual(0);
  });

});
