/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const logger = require('winston');
const portfinder = require('portfinder');

describe('cli serve', () => {

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

    function webpackDevServer() {
      return {
        listen: () => {}
      };
    }

    require('../cli/serve')({}, {}, () => {}, webpackDevServer);
    expect(called).toEqual(true);
    mock.stop(f);
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

    function webpackDevServer() {
      return {
        listen: () => {}
      };
    }

    require('../cli/serve')({}, {}, (config) => {
      expect(config.entry.test.length).toEqual(2);
      expect(config.entry.test[0]).toContain(port);
      expect(config.entry.test[1]).toContain(url);
      mock.stop(f);
      done();
    }, webpackDevServer);
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
        listen: (port, cb) => {
          cb(err);
          expect(logger.error).toHaveBeenCalledWith(err);
          mock.stop(f);
          done();
        }
      };
    }

    require('../cli/serve')({}, {}, () => {}, webpackDevServer);
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
        listen: (port, cb) => {
          cb();
          expect(logger.error).not.toHaveBeenCalled();
          mock.stop(f);
          done();
        }
      };
    }

    require('../cli/serve')({}, {}, () => {}, webpackDevServer);
  });

  it('should read port from skyuxconfig.json if it exists first', (done) => {
    const f = '../config/webpack/serve.webpack.config';
    const port = 'skyux-config.json-port';
    const skyPagesConfig = {
      app: {
        port: port
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
          mock.stop(f);
          done();
        }
      };
    }

    require('../cli/serve')({}, skyPagesConfig, () => {}, webpackDevServer);
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
          mock.stop(f);
          done();
        }
      };
    }

    require('../cli/serve')({}, {}, () => {}, webpackDevServer);
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
          mock.stop(f);
          done();
        }
      };
    }

    require('../cli/serve')({}, {}, () => {}, webpackDevServer);
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
      mock.stop(f);
      done();
    });

    spyOn(portfinder, 'getPortPromise').and.callFake(() => {
      return new Promise((resolve, reject) => {
        reject(err);
      });
    });

    function webpackDevServer() {
      return {
        listen: () => {}
      };
    }

    require('../cli/serve')({}, {}, () => {}, webpackDevServer);
  });

});
