/*jshint jasmine: true, node: true */
'use strict';

const programUtil = require('../loader/sky-tslint/program');

describe('SKY UX tslint Webpack checker plugin', () => {
  const pluginPath = '../loader/sky-tslint/checker-plugin';

  it('should delete the TSLint program on the "done" hook', () => {
    spyOn(programUtil, 'clearProgram').and.callFake(() => {});
    const plugin = require(pluginPath);
    const mockCompiler = {
      plugin: (hook, callback) => callback()
    };
    const instance = new plugin();
    instance.apply(mockCompiler);
    expect(programUtil.clearProgram).toHaveBeenCalled();
  });
});
