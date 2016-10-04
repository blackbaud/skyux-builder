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

    mock('../config/webpack/serve.webpack.config', {
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
      done();
    }, webpackDevServer);
  });

  it('should handle a webpackDevServer error', () => {
    const err = 'custom-error1';

    spyOn(logger, 'error');
    mock('../config/webpack/serve.webpack.config', {
      getWebpackConfig: () => ({
        devServer: {}
      })
    });

    function webpackDevServer() {
      return {
        listen: (port, cb) => {
          cb(err);
          expect(logger.error).toHaveBeenCalledWith(err);
        }
      };
    }

    require('../cli/serve')({}, {}, () => {}, webpackDevServer);
  });

});
