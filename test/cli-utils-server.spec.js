/*jshint jasmine: true, node: true */
'use strict';

const logger = require('@blackbaud/skyux-logger');
const mock = require('mock-require');
const path = require('path');

describe('server utils', () => {

  let closeCalled = false;
  let onErrorCB;
  let customServerError;
  let customPortError;
  let customPortNumber;

  beforeEach(() => {
    spyOn(logger, 'info');
  });

  afterEach(() => {
    closeCalled = false;
    onErrorCB = undefined;
    customServerError = undefined;
    customPortError = undefined;
    customPortNumber = undefined;
    mock.stopAll();
  });

  function bind() {
    mock('https', {
      createServer: () => ({
        on: (err, cb) => onErrorCB = cb,
        close: () => closeCalled = true,
        listen: (port, host, cb) => {
          if (customServerError) {
            onErrorCB(customServerError);
          }
          cb(port);
        }
      })
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

  it('should accept a root', () => {
    const server = bind();
    const root = 'custom-root';
    server.start(root).then(() =>{

    });
  });

  it('should close the http server if it exists', (done) => {
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

  it('should catch http server failures', (done) => {

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

    const server = bind();
    server.start().catch(err => {
      expect(err).toBe(customPortError);
      done();
    });
  });

  it('should allow the distPath to be specified', (done) => {
    spyOn(path, 'resolve').and.callThrough();

    const customDistPath = 'custom-dist';
    const server = bind();

    server.start('custom-root', customDistPath)
      .then(() => {
        expect(path.resolve).toHaveBeenCalledWith(process.cwd(), customDistPath);
        done();
      });
  });
});
