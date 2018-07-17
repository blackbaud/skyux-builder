/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const portfinder = require('portfinder');
const logger = require('@blackbaud/skyux-logger');

describe('cli serve', () => {
  let mockLocaleProcessor;
  let MockWebpackDevServer;

  beforeEach(() => {
    mockLocaleProcessor = {
      prepareLocaleFiles() {}
    };

    MockWebpackDevServer = function () {
      return {
        listen: () => {}
      };
    };

    mock('../lib/locale-assets-processor', mockLocaleProcessor);
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should call getWebpackConfig', () => {
    let called = false;
    const f = '../config/webpack/serve.webpack.config';
    mock(f, {
      getWebpackConfig: () => {
        called = true;
        return {
          devServer: {}
        };
      }
    });

    mock.reRequire('../cli/serve')({}, {}, () => {}, MockWebpackDevServer);
    expect(called).toEqual(true);
  });

  it('should prepend devServer url to entries', (done) => {
    const url = 'test-url';
    const port = 1234;
    const f = '../config/webpack/serve.webpack.config';
    mock(f, {
      getWebpackConfig: () => ({
        entry: {
          'test': [url]
        },
        devServer: {
          inline: true,
          port: port
        }
      })
    });

    mock.reRequire('../cli/serve')({}, {}, (config) => {
      expect(config.entry.test.length).toEqual(2);
      expect(config.entry.test[0]).toContain(port);
      expect(config.entry.test[1]).toContain(url);
      done();
    }, MockWebpackDevServer);
  });

  it('should prepend hrm url to entries if devServer.hot is set', (done) => {
    const publicPath = '/public-path';
    const url = 'my-url';
    const port = 1234;

    const f = '../config/webpack/serve.webpack.config';
    spyOn(logger, 'info');
    mock(f, {
      getWebpackConfig: () => ({
        output: {},
        entry: {
          'test': [url]
        },
        devServer: {
          hot: true,
          publicPath: publicPath,
          port: port
        }
      })
    });

    mock.reRequire('../cli/serve')({}, {}, (config) => {
      expect(config.entry.test[0]).toEqual('webpack/hot/only-dev-server');
      expect(config.output.publicPath).toEqual(`https://localhost:${port}${publicPath}`);
      expect(logger.info).toHaveBeenCalledWith('Using hot module replacement.');
      done();
    }, MockWebpackDevServer);
  });

  it('should handle a webpackDevServer error', (done) => {
    const err = 'custom-error1';
    const f = '../config/webpack/serve.webpack.config';

    spyOn(logger, 'error');
    mock(f, {
      getWebpackConfig: () => ({
        devServer: {}
      })
    });

    function webpackDevServer() {
      return {
        listen: (port, host, cb) => {
          cb(err);
          expect(logger.error).toHaveBeenCalledWith(err);
          done();
        }
      };
    }

    mock.reRequire('../cli/serve')({}, {}, () => {}, webpackDevServer);
  });

  it('should handle a webpackDevServer without error', (done) => {
    const f = '../config/webpack/serve.webpack.config';

    spyOn(logger, 'error');
    mock(f, {
      getWebpackConfig: () => ({
        devServer: {}
      })
    });

    function webpackDevServer() {
      return {
        listen: (port, host, cb) => {
          cb();
          expect(logger.error).not.toHaveBeenCalled();
          done();
        }
      };
    }

    mock.reRequire('../cli/serve')({}, {}, () => {}, webpackDevServer);
  });

  it('should read port from skyuxconfig.json if it exists first', (done) => {
    const f = '../config/webpack/serve.webpack.config';
    const port = 'skyux-config.json-port';
    const skyPagesConfig = {
      skyux: {
        app: {
          port: port
        }
      }
    };

    mock(f, {
      getWebpackConfig: () => ({
        devServer: {}
      })
    });

    function webpackDevServer() {
      return {
        listen: (p) => {
          expect(p).toEqual(port);
          done();
        }
      };
    }

    mock.reRequire('../cli/serve')({}, skyPagesConfig, () => {}, webpackDevServer);
  });

  it('should read port from config.devServer.port if it exists second', (done) => {
    const f = '../config/webpack/serve.webpack.config';
    const port = 'devServer-port';

    mock(f, {
      getWebpackConfig: () => ({
        devServer: {
          port: port
        }
      })
    });

    function webpackDevServer() {
      return {
        listen: (p) => {
          expect(p).toEqual(port);
          done();
        }
      };
    }

    mock.reRequire('../cli/serve')({}, {}, () => {}, webpackDevServer);
  });

  it('should find a dynamic port if not in skyuxconfig.json or devServer.port', (done) => {
    const f = '../config/webpack/serve.webpack.config';
    const port = 'dynamic-port';

    mock(f, {
      getWebpackConfig: () => ({
        devServer: {}
      })
    });

    spyOn(portfinder, 'getPortPromise').and.callFake(() => {
      return new Promise(resolve => {
        resolve(port);
      });
    });

    function webpackDevServer() {
      return {
        listen: (p) => {
          expect(p).toEqual(port);
          done();
        }
      };
    }

    mock.reRequire('../cli/serve')({}, {}, () => {}, webpackDevServer);
  });

  it('should throw an error if unable to find a port', (done) => {
    const f = '../config/webpack/serve.webpack.config';
    const err = 'dynamic-port-error';

    mock(f, {
      getWebpackConfig: () => ({
        devServer: {}
      })
    });

    spyOn(logger, 'error').and.callFake((e) => {
      expect(e).toEqual(err);
      done();
    });

    spyOn(portfinder, 'getPortPromise').and.callFake(() => {
      return new Promise((resolve, reject) => {
        reject(err);
      });
    });

    mock.reRequire('../cli/serve')({}, {}, () => {}, MockWebpackDevServer);
  });

  it('should call prepareLocaleFiles()', (done) => {
    const spy = spyOn(mockLocaleProcessor, 'prepareLocaleFiles').and.callThrough();

    mock('../config/webpack/serve.webpack.config', {
      getWebpackConfig: () => {
        return {
          devServer: {}
        };
      }
    });

    function webpackDevServer() {
      return {
        listen() {
          expect(spy).toHaveBeenCalledWith();
          done();
        }
      };
    }

    mock.reRequire('../cli/serve')({}, {}, () => {}, webpackDevServer);
  });
});
