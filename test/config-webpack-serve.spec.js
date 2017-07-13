/*jshint jasmine: true, node: true */
'use strict';

const logger = require('winston');
const mock = require('mock-require');
const runtimeUtils = require('../utils/runtime-test-utils');

describe('config webpack serve', () => {

  let paramArgv;

  beforeAll(() => {
    mock('../utils/browser', (argv) => {
      paramArgv = argv;
    });
  });

  afterEach(() => {
    paramArgv = undefined;
    mock.stop('../utils/browser');
  });

  it('should expose a getWebpackConfig method', () => {
    const lib = require('../config/webpack/serve.webpack.config');
    expect(typeof lib.getWebpackConfig).toEqual('function');
  });

  it('should set default `launch` to `host', () => {
    spyOn(logger, 'info');
    const lib = require('../config/webpack/serve.webpack.config');
    const config = lib.getWebpackConfig({}, runtimeUtils.getDefault());

    config.plugins.forEach(plugin => {
      if (plugin.name === 'WebpackPluginDone') {
        plugin.apply({
          options: {
            appConfig: {
              base: 'my-custom-base'
            },
            devServer: {
              port: 1234
            }
          },
          plugin: (evt, cb) => {
            if (evt === 'done') {
              cb({
                toJson: () => ({
                  chunks: []
                })
              });
            }
          }
        });
      }
    });

    expect(paramArgv.launch).toEqual('host');
  });

  it('should only log the ready message once during multiple dones', () => {

    spyOn(logger, 'info');
    const lib = require('../config/webpack/serve.webpack.config');
    const config = lib.getWebpackConfig({}, runtimeUtils.getDefault());

    config.plugins.forEach(plugin => {
      if (plugin.name === 'WebpackPluginDone') {
        plugin.apply({
          options: {
            appConfig: {
              base: 'my-custom-base'
            },
            devServer: {
              port: 1234
            }
          },
          plugin: (evt, cb) => {
            if (evt === 'done') {

              // Simulating a save by calling callback twice
              cb({
                toJson: () => ({
                  chunks: []
                })
              });
              cb({
                toJson: () => ({
                  chunks: []
                })
              });
            }
          }
        });
      }
    });

    expect(logger.info).toHaveBeenCalledWith(`SKY UX builder is ready.`);
  });

});
