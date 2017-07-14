/*jshint jasmine: true, node: true */
'use strict';

const logger = require('winston');
const mock = require('mock-require');

describe('server utils', () => {

  let closeCalled = false;
  let customServerError;
  let customPortError;
  let customPortNumber;

  beforeEach(() => {
    spyOn(logger, 'info');
  });

  afterEach(() => {
    closeCalled = false;
    customServerError = undefined;
    customPortError = undefined;
    customPortNumber = undefined;
    mock.stopAll();
  });

  function bind() {
    mock('http-server', {
      createServer: (settings) => {

        if (customServerError) {
          settings.logFn({}, {}, customServerError);
        }

        if (customPortNumber) {
          settings.logFn({}, {});
        }

        return {
          close: () => closeCalled = true,
          listen: (port, host, cb) => {
            cb();
          }
        };
      }
    });

    mock('portfinder', {
      getPortPromise: () => {
        if (customPortError) {
          return Promise.reject(customPortError);
        } else {
          return Promise.resolve(customPortNumber);
        }
      }
    });

    return mock.reRequire('../cli/utils/server');
  }

  it('should expose start and stop methods', () => {
    const server = bind();
    expect(server.start).toBeDefined();
    expect(server.stop).toBeDefined();
  });

  it('should close the http-server if it exists', (done) => {
    const server = bind();

    server.stop();
    expect(closeCalled).toBe(false);

    server.start().then(() => {
      logger.info.calls.reset();
      server.stop();
      expect(closeCalled).toBe(true);
      expect(logger.info).toHaveBeenCalledWith(`Stopping http server`);
      done();
    });
  });

  it('should catch http-server failures', (done) => {

    customServerError = 'custom-error';
    const server = bind();

    server.start().catch(err => {
      expect(err).toBe(customServerError);
      done();
    });
  });

  it('should resolve the portfinder port', (done) => {
    customPortNumber = 1234;
    const server = bind();

    server.start().then(port => {
      expect(port).toBe(customPortNumber);
      done();
    });
  });

  it('should catch portfinder failures', (done) => {

    customPortError = 'custom-portfinder-error';
    mock('portfinder', {
      getPortPromise: () => {
        Promise.reject(customPortError);
      }
    });

    const server = bind();
    server.start().catch(err => {
      mock.stop('portfinder');
      expect(err).toBe(customPortError);
      done();
    });
  });
});
