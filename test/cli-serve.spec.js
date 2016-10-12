/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const logger = require('winston');

describe('cli serve', () => {

  it('should call getWebpackConfig', () => {
    let called = false;
    mock('../config/webpack/serve.webpack.config', {
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

  it('should handle a webpackDevServer error', () => {
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
        }
      };
    }

    require('../cli/serve')({}, {}, () => {}, webpackDevServer);
  });

});
