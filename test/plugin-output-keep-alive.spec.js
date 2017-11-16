/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');

describe('SKY UX plugin file processor', () => {
  let _compilerHooksCalled;
  let _compilationHooksCalled;

  let _mockCompiler;
  beforeEach(() => {
    _compilerHooksCalled = [];
    _compilationHooksCalled = [];

    _mockCompiler = {
      plugin(hook, callback) {
        _compilerHooksCalled.push(hook);
        callback({
          plugin(hook, callback) {
            _compilationHooksCalled.push(hook);
            callback();
          }
        });
      }
    };
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should return a constructor', () => {
    const { OutputKeepAlivePlugin } = mock.reRequire('../plugin/output-keep-alive');
    expect(typeof OutputKeepAlivePlugin.constructor).toBeDefined();
  });

  it('should output to the console', () => {
    const stdoutSpy = spyOn(process.stdout, 'write').and.callThrough();
    const { OutputKeepAlivePlugin } = mock.reRequire('../plugin/output-keep-alive');
    const plugin = new OutputKeepAlivePlugin({ enabled: true });

    plugin.apply(_mockCompiler);

    expect(stdoutSpy.calls.count()).toEqual(1);
    expect(_compilerHooksCalled).toEqual(['compilation']);
    expect(_compilationHooksCalled).toEqual(['build-module']);
  });

  it('should not output to the console if disabled', () => {
    const stdoutSpy = spyOn(process.stdout, 'write').and.callThrough();
    const { OutputKeepAlivePlugin } = mock.reRequire('../plugin/output-keep-alive');
    const plugin = new OutputKeepAlivePlugin();

    plugin.apply(_mockCompiler);

    expect(stdoutSpy).not.toHaveBeenCalled();
    expect(_compilerHooksCalled).toEqual([]);
    expect(_compilationHooksCalled).toEqual([]);
  });
});
