/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const logger = require('../utils/logger');
const portfinder = require('portfinder');

describe('cli pact', () => {
  let originalArgv = process.argv;

  function MockServer() { }

  MockServer.prototype.on = function () { };
  MockServer.prototype.start = function () { };

  beforeEach(() => {
    spyOn(global, 'setTimeout').and.callFake(cb => cb());
    spyOn(process, 'exit').and.returnValue();
    spyOn(logger, 'info').and.returnValue();
    spyOn(logger, 'error').and.returnValue();

    mock('http-proxy', {
      createProxyServer: (options) => {
        return {
          on: (event, callback) => {

          },
          web: (req, res, options) => {

          }
        }
      }
    });

    mock('http', {
      createServer: (callback) => {
        return {
          on: (event, callback) => {
            return {
              listen: (port, host) => {

              }
            }
          }
        }
      }
    });

    mock('portfinder', {
      getPortPromise: (config) => {
        return Promise.resolve(config.port);
      }
    });

    mock('../cli/utils/ts-linter', {
      lintSync: () => {
        return {
          exitCode: 0,
          errors: []
        };
      }
    });

    mock('../config/sky-pages/sky-pages.config', {
      outPath: (path) => path,
      getSkyPagesConfig: (path) => {
        return {
          skyux: {
            pacts: [
              {
                "provider": "test-provider",
                "consumer": "test-consumer",
                "spec": 1
              }
            ]
          }
        }
      }
    });

    mock('../cli/utils/config-resolver', {
      resolve: (command) => `${command}-config.js`
    });

  });

  afterEach(() => {
    mock.stopAll();
    process.argv = originalArgv;
  });

  it('should load the pact config when running pact command', (done) => {
    var _configPath;
    spyOn(MockServer.prototype, 'start').and.callFake(() => {
      expect(_configPath).toEqual('pact-config.js');
      done();
    });
    mock('karma', {
      config: {
        parseConfig: (configPath) => _configPath = configPath

      },
      Server: MockServer
    });

    const test = mock.reRequire('../cli/pact');
    test('pact');
  });

  it('should save the current command to argv', (done) => {
    spyOn(MockServer.prototype, 'start').and.callFake(() => {
      expect(argv.command).toEqual('pact');
      done();
    });
    mock('karma', {
      config: {
        parseConfig: () => { }
      },
      Server: MockServer
    });
    const test = mock.reRequire('../cli/pact');
    const argv = {};
    test('pact', argv);
  });

  it('should start a karma server', (done) => {
    spyOn(MockServer.prototype, 'start').and.callFake(() => {
      expect(MockServer.prototype.start).toHaveBeenCalled();
      done();
    });
    mock('karma', {
      config: {
        parseConfig: () => { }
      },
      Server: MockServer
    });
    const test = mock.reRequire('../cli/pact');
    test('pact');
  });

  it('should process the exit code from karma server', (done) => {
    let _onExit;

    mock('karma', {
      config: {
        parseConfig: () => { }
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
        this.start = () => {
          _onExit();
          expect(process.exit).toHaveBeenCalledWith(0);
          done();
        };
      }
    });
    const test = mock.reRequire('../cli/pact');
    test('pact');

  });

  it('should not change the exit code if the server has already failed', (done) => {
    mock('karma', {
      config: {
        parseConfig: () => { }
      },
      Server: function (config, callback) {
        callback(1);
        this.on = () => { };
        this.start = () => {
          expect(process.exit).toHaveBeenCalledWith(1);
          done();
        };
      }
    });
    const test = mock.reRequire('../cli/pact');
    test('pact');
  });

  it('should execute tslint before each karma run and pass the exit code', (done) => {
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
        parseConfig: () => { }
      },
      Server: function (config, onExit) {
        _onExit = onExit;
        this.on = (hook, callback) => {
          _hooks.push(hook);
          callback();
        };
        this.start = () => {
          _onExit(0);
          expect(_hooks[0]).toEqual('run_start');
          expect(_exitCode).toEqual(1);
          expect(process.exit).toHaveBeenCalledWith(1);
          done();
        };
      }
    });
    const test = mock.reRequire('../cli/pact');
    test('pact');
  });

  it('should not output a tslint error message if tslint passes', (done) => {
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
        parseConfig: () => { }
      },
      Server: function (config, onExit) {
        _onExit = onExit;
        this.on = (hook, callback) => {
          _hooks.push(hook);
          callback();
        };
        this.start = () => {
          _onExit(0);
          expect(_hooks[1]).toEqual('run_complete');
          expect(process.exit).toHaveBeenCalledWith(0);
          done();
        };
      }
    });
    const test = mock.reRequire('../cli/pact');
    test('pact');
  });

  it('should handle signal interrupted', (done) => {
    let _onExit;

    mock.stop('../cli/utils/ts-linter');

    // After SIGINT, lintSync returns undefined.
    mock('../cli/utils/ts-linter', {
      lintSync: () => undefined
    });

    mock('karma', {
      config: {
        parseConfig: () => { }
      },
      Server: function (config, onExit) {
        _onExit = onExit;
        this.on = (hook, callback) => callback();
        this.start = () => {
          _onExit(0);
          expect(process.exit).toHaveBeenCalledWith(0);
          done();
        };
      }
    });

    const test = mock.reRequire('../cli/pact');

    test('pact');
  });

  it('handles error in port finding and exits process', (done) => {

    mock('karma', {
      config: {
        parseConfig: () => { }
      },
      Server: MockServer
    });

    mock.stop('portfinder');
    mock('portfinder', {
      getPortPromise: (config) => {
        return Promise.reject('error in finding available port');
      }
    });

    // round about way of checking these calls after process.exit() should cancel the process.
    // Since it's spied on it continues execution so synthetically cancel it by calling done()
    // in the next called function.
    mock('../utils/pact-servers', {
      savePactServer: (a, b, c) => {
        expect(logger.error)
          .toHaveBeenCalledWith('error in finding available port');
        expect(process.exit).toHaveBeenCalled();
        done();
      },
      savePactProxyServer: (url) => {

      }
    });

    const test = mock.reRequire('../cli/pact');

    // process.exit is spyed on, so command continues execution after it should exit.
    // Need to eat the error to reach the expectations
    test('pact');

  });

  it('exits process if pacts are not provided in config', (done) => {
    mock('karma', {
      config: {
        parseConfig: () => { }
      },
      Server: MockServer
    });

    mock.stop('../config/sky-pages/sky-pages.config');
    mock('../config/sky-pages/sky-pages.config', {
      outPath: (path) => path,
      getSkyPagesConfig: (path) => {
        return {
          skyux: {

          }
        }
      }
    });
    const test = mock.reRequire('../cli/pact');

    // process.exit is spyed on, so command continues execution after it should exit.
    // Need to eat the error to reach the expectations
    try {
      test('pact');
    }
    catch (exception) {
      expect(logger.error)
        .toHaveBeenCalledWith('skyux pact failed! pacts does not exist on configuration file.');
      expect(process.exit).toHaveBeenCalled();
      done();
    }

  });

  it('sets headers upon request and response on proxy server', (done) => {

    mock('karma', {
      config: {
        parseConfig: () => { }
      },
      Server: MockServer
    });


    let originHeader;
    let proxyReq = {
      setHeader: (header, value) => {
        originHeader = value;
      }
    }
    let proxyRes = {
      headers: {

      }
    };
    let response = {
      headers: {
        origin: 'localhost:1234'
      }
    }
    mock('http-proxy', {
      createProxyServer: (options) => {
        return {
          on: (event, callback) => {
            if (event === 'proxyReq')
              callback(proxyReq);
            else
              callback(proxyRes, response);
          },
          web: (req, res, options) => {

          }
        }
      }
    });
    const test = mock.reRequire('../cli/pact');

    spyOn(MockServer.prototype, 'start').and.callFake(() => {
      expect(originHeader).toEqual('https://host.nxt.blackbaud.com');
      proxyRes.headers['Access-Control-Allow-Origin'] = response.headers.origin;
      expect(proxyRes.headers['Access-Control-Allow-Origin']).toEqual(response.headers.origin);
      done();
    });

    test('pact');

  });

  it('sets Origin header on request to config setting if it exists', (done) => {
    mock('karma', {
      config: {
        parseConfig: () => { }
      },
      Server: MockServer
    });

    mock.stop('../config/sky-pages/sky-pages.config');
    mock('../config/sky-pages/sky-pages.config', {
      outPath: (path) => path,
      getSkyPagesConfig: (path) => {
        return {
          skyux: {
            pacts: [
              {
                "provider": "test-provider",
                "consumer": "test-consumer",
                "spec": 1
              }
            ],
            host: {
              url: 'test.nxt.blackbaud.com'
            }
          }
        }
      }
    });

    let originHeader;
    let proxyReq = {
      setHeader: (header, value) => {
        originHeader = value;
      }
    }
    let proxyRes = {
      headers: {

      }
    };
    let response = {
      headers: {
        origin: 'localhost:1234'
      }
    }
    mock('http-proxy', {
      createProxyServer: (options) => {
        return {
          on: (event, callback) => {
            if (event === 'proxyReq')
              callback(proxyReq);
            else
              callback(proxyRes, response);
          },
          web: (req, res, options) => {

          }
        }
      }
    });
    const test = mock.reRequire('../cli/pact');

    spyOn(MockServer.prototype, 'start').and.callFake(() => {
      expect(originHeader).toEqual('test.nxt.blackbaud.com');
      proxyRes.headers['Access-Control-Allow-Origin'] = response.headers.origin;
      expect(proxyRes.headers['Access-Control-Allow-Origin']).toEqual(response.headers.origin);
      done();
    });
    test('pact');

  });

  it('gets correct pact server before call to proxy server', (done) => {
    mock('karma', {
      config: {
        parseConfig: () => { }
      },
      Server: MockServer
    });

    let request = {
      url: 'http://localhost:9876/test-provider/api/test'
    }
    mock.stop('http');
    mock('http', {
      createServer: (callback) => {
        callback(request, {});
        return {
          on: (event, callback) => {
            return {
              listen: (port, host) => {

              }
            }
          }
        }
      }
    });

    let targetUrl;
    mock.stop('http-proxy');
    mock('http-proxy', {
      createProxyServer: (options) => {
        return {
          on: (event, callback) => {

          },
          web: (req, res, options) => {
            targetUrl = options.target;
          }
        }
      }
    });

    const test = mock.reRequire('../cli/pact');

    spyOn(MockServer.prototype, 'start').and.callFake(() => {

      expect(targetUrl).toEqual('http://localhost:8000');
      done();
    });
    test('pact');

  });

  it('logs error when malformed proxy url is requested', (done) => {
    mock('karma', {
      config: {
        parseConfig: () => { }
      },
      Server: MockServer
    });

    let request = {
      url: 'http://localhost:9876/test-provdr/api/test'
    }
    mock.stop('http');
    mock('http', {
      createServer: (callback) => {
        callback(request, {});
        return {
          on: (event, callback) => {
            return {
              listen: (port, host) => {

              }
            }
          }
        }
      }
    });

    let targetUrl;
    mock.stop('http-proxy');
    mock('http-proxy', {
      createProxyServer: (options) => {
        return {
          on: (event, callback) => {

          },
          web: (req, res, options) => {
            targetUrl = options.target;
          }
        }
      }
    });

    const test = mock.reRequire('../cli/pact');

    spyOn(MockServer.prototype, 'start').and.callFake(() => {
      expect(logger.error)
        .toHaveBeenCalledWith(`Pact proxy path is invalid.  Expected format is base/provider-name/api-path.`);
      done();
    });
    test('pact');

  });

  it('logs when proxy server is successfully started', (done) => {
    mock('karma', {
      config: {
        parseConfig: () => { }
      },
      Server: MockServer
    });

    let request = {
      url: 'http://localhost:9876/test-provdr/api/test'
    }
    mock.stop('http');
    mock('http', {
      createServer: (callback) => {
        callback(request, {});
        return {
          on: (event, callback) => {
            if (event === 'connect') {
              callback();
            }
            return {
              listen: (port, host) => {

              }
            }
          }
        }
      }
    });

    let targetUrl;
    mock.stop('http-proxy');
    mock('http-proxy', {
      createProxyServer: (options) => {
        return {
          on: (event, callback) => {

          },
          web: (req, res, options) => {
            targetUrl = options.target;
          }
        }
      }
    });

    const test = mock.reRequire('../cli/pact');

    spyOn(MockServer.prototype, 'start').and.callFake(() => {
      expect(logger.info)
        .toHaveBeenCalledWith(`Pact proxy server successfully started on http://localhost:8001`);
      done();
    });
    test('pact');

  });
});
