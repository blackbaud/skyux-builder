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

  it('should spawn tslint', () => {
    let _executed = false;
    spyOn(logger, 'info').and.returnValue();
    mock('../config/sky-pages/sky-pages.config', {
      spaPath: (filePath) => filePath
    });
    mock('cross-spawn', {
      sync: () => {
        _executed = true;
        return {
          status: 0,
          output: [new Buffer('some error')]
        };
      }
    });
    const tsLinter = mock.reRequire('../cli/utils/ts-linter');
    const result = tsLinter.lintSync();
    expect(_executed).toEqual(true);
    expect(result.exitCode).toEqual(0);
  });

  it('should handle an error when spawning', () => {
    let spyLogger = spyOn(logger, 'error');
    let spyProcess = spyOn(process, 'exit');

    const error = 'custom-error';
    mock('cross-spawn', {
      sync: () => {
        return {
          error: {
            message: error
          }
        };
      }
    });

    const tsLinter = mock.reRequire('../cli/utils/ts-linter');
    tsLinter.lintSync();

    expect(spyLogger).toHaveBeenCalledWith(error);
    expect(spyProcess).toHaveBeenCalledWith(1);
  })

  it('should log an error if linting errors found', () => {
    spyOn(logger, 'info').and.returnValue();
    spyOn(logger, 'error').and.returnValue();
    mock('../config/sky-pages/sky-pages.config', {
      spaPath: (filePath) => filePath
    });
    mock('cross-spawn', {
      sync: () => {
        return {
          status: 1,
          output: [new Buffer('some error'), new Buffer('another error')]
        };
      }
    });
    const tsLinter = mock.reRequire('../cli/utils/ts-linter');
    const result = tsLinter.lintSync();
    expect(result.exitCode).toEqual(1);
    expect(logger.error).toHaveBeenCalled();
  });

  it('should not log an error if linting errors are not found', () => {
    spyOn(logger, 'info').and.returnValue();
    spyOn(logger, 'error').and.returnValue();
    mock('../config/sky-pages/sky-pages.config', {
      spaPath: (filePath) => filePath
    });
    mock('cross-spawn', {
      sync: () => {
        return {
          status: 0,
          output: [null, new Buffer('')]
        };
      }
    });
    const tsLinter = mock.reRequire('../cli/utils/ts-linter');
    const result = tsLinter.lintSync();
    expect(result.exitCode).toEqual(0);
    expect(logger.error).not.toHaveBeenCalled();
  });
});
