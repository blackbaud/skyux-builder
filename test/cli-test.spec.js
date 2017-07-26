/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const logger = require('../utils/logger');

describe('cli test', () => {
  let originalArgv = process.argv;

  function MockServer(config, onExit) {}
  MockServer.prototype.on = function () {};
  MockServer.prototype.start = function () {};

  beforeEach(() => {
    spyOn(global, 'setTimeout').and.callFake(cb => cb());
    spyOn(process, 'exit').and.returnValue();
    spyOn(logger, 'info').and.returnValue();
    spyOn(logger, 'error').and.returnValue();
    mock('../cli/utils/ts-linter', {
      lintSync: () => {
        return {
          exitCode: 0,
          errors: []
        };
      }
    });
    mock('../config/sky-pages/sky-pages.config', {
      outPath: (path) => path
    });
  });

  afterEach(() => {
    mock.stopAll();
    process.argv = originalArgv;
  });

  it('should load the test config when running test command', () => {
    let _configPath;
    mock('karma', {
      config: {
        parseConfig: (configPath) => _configPath = configPath
      },
      Server: MockServer
    });
    const test = mock.reRequire('../cli/test');
    test('test', {});
    expect(_configPath.indexOf('/test.karma.conf.js') > -1).toEqual(true);
  });

  it('should load the watch config when running watch command', () => {
    let _configPath;
    mock('karma', {
      config: {
        parseConfig: (configPath) => _configPath = configPath
      },
      Server: MockServer
    });
    const test = mock.reRequire('../cli/test');
    test('watch');
    expect(_configPath.indexOf('/watch.karma.conf.js') > -1).toEqual(true);
  });

  it('should save the current command to argv', () => {
    mock('karma', {
      config: {
        parseConfig: () => {}
      },
      Server: MockServer
    });
    const test = mock.reRequire('../cli/test');
    const argv = {};
    test('watch', argv);
    expect(argv.command).toEqual('watch');
  });

  it('should start a karma server', () => {
    spyOn(MockServer.prototype, 'start').and.returnValue();
    mock('karma', {
      config: {
        parseConfig: () => {}
      },
      Server: MockServer
    });
    const test = mock.reRequire('../cli/test');
    test('test');
    expect(MockServer.prototype.start).toHaveBeenCalled();
  });

  it('should process the exit code from karma server', () => {
    let _onExit;
    mock('karma', {
      config: {
        parseConfig: () => {}
      },
      Server: function (config, onExit) {
        this.on = (hook, callback) => {
          if (hook === 'run_start') {
            _onExit = () => {
              onExit(0);
            };
            callback();
          }
        };
        this.start = () => {};
      }
    });
    const test = mock.reRequire('../cli/test');
    test('test');
    _onExit();
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  it('should not change the exit code if the server has already failed', () => {
    mock('karma', {
      config: {
        parseConfig: () => {}
      },
      Server: function (config, callback) {
        callback(1);
        this.on = () => {};
        this.start = () => {};
      }
    });
    const test = mock.reRequire('../cli/test');
    test('test');
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should execute tslint before each karma run and pass the exit code', () => {
    let _hooks = [];
    let _exitCode;
    let _onExit;
    mock.stop('../cli/utils/ts-linter');
    mock('../cli/utils/ts-linter', {
      lintSync: () => {
        _exitCode = 1;
        return {
          exitCode: 1,
          errors: ['foo']
        };
      }
    });
    mock('karma', {
      config: {
        parseConfig: () => {}
      },
      Server: function (config, onExit) {
        _onExit = onExit;
        this.on = (hook, callback) => {
          _hooks.push(hook);
          callback();
        };
        this.start = () => {};
      }
    });
    const test = mock.reRequire('../cli/test');
    test('test');
    _onExit(0);
    expect(_hooks[0]).toEqual('run_start');
    expect(_exitCode).toEqual(1);
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should not output a tslint error message if tslint passes', () => {
    let _hooks = [];
    let _onExit;
    mock.stop('../cli/utils/ts-linter');
    mock('../cli/utils/ts-linter', {
      lintSync: () => {
        return {
          exitCode: 0
        };
      }
    });
    mock('karma', {
      config: {
        parseConfig: () => {}
      },
      Server: function (config, onExit) {
        _onExit = onExit;
        this.on = (hook, callback) => {
          _hooks.push(hook);
          callback();
        };
        this.start = () => {};
      }
    });
    const test = mock.reRequire('../cli/test');
    test('test');
    _onExit(0);
    expect(_hooks[1]).toEqual('run_complete');
    expect(process.exit).toHaveBeenCalledWith(0);
  });
});
