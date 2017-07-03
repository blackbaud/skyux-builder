/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const tslint = require('tslint');

describe('SKY UX tslint program util', () => {
  const utilPath = '../loader/sky-tslint/program';

  beforeEach(() => {
    spyOn(tslint.Linter, 'createProgram').and.returnValue({});
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should create and return a TSLint program based on tsconfig.json path', () => {
    const util = mock.reRequire(utilPath);
    const tsconfigPath = 'tsconfig.json';
    const program = util.getProgram(tsconfigPath);
    expect(program).toBeDefined();
    expect(tslint.Linter.createProgram).toHaveBeenCalledWith(tsconfigPath);
  });

  it('should return an existing TSLint program on proceeding requests', () => {
    const util = mock.reRequire(utilPath);
    const tsconfigPath = 'tsconfig.json';

    util.getProgram(tsconfigPath);
    expect(tslint.Linter.createProgram.calls.count()).toEqual(1);

    util.getProgram(tsconfigPath);
    expect(tslint.Linter.createProgram.calls.count()).toEqual(1);
  });

  it('should delete a TSLint program', () => {
    const util = mock.reRequire(utilPath);
    const tsconfigPath = 'tsconfig.json';

    util.getProgram(tsconfigPath);
    expect(tslint.Linter.createProgram.calls.count()).toEqual(1);

    util.clearProgram();
    util.getProgram(tsconfigPath);
    expect(tslint.Linter.createProgram.calls.count()).toEqual(2);
  });
});
