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
          stderr: new Buffer('')
        };
      }
    });
    const tsLinter = mock.reRequire('../cli/utils/ts-linter');
    const result = tsLinter.lintSync();
    expect(_executed).toEqual(true);
    expect(result.exitCode).toEqual(0);
  });

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
          stderr: new Buffer('Error: something bad happened.')
        };
      }
    });
    const tsLinter = mock.reRequire('../cli/utils/ts-linter');
    const result = tsLinter.lintSync();
    expect(result.exitCode).toEqual(1);
    expect(logger.error).toHaveBeenCalled();
  });
});
