/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');

describe('cli lint', () => {
  afterEach(() => {
    mock.stopAll();
  });

  it('should run the linter', () => {
    spyOn(process, 'exit').and.returnValue();
    mock('../cli/utils/ts-linter', {
      lintSync: () => 0
    });
    const lint = mock.reRequire('../cli/lint');
    lint();
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  it('should process the exit code', () => {
    spyOn(process, 'exit').and.returnValue();
    mock('../cli/utils/ts-linter', {
      lintSync: () => 1
    });
    const lint = mock.reRequire('../cli/lint');
    lint();
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
