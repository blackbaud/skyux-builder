/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const logger = require('winston');

describe('config webpack serve', () => {

  let lib;
  let called;
  let config;
  let pluginConfig = {
    options: {
      argv: {},
      appConfig: {
        base: 'my-custom-base'
      },
      devServer: {
        port: 1234,
        host: ''
      },
      SKY_PAGES: {
        'blackbaud-sky-pages-out-skyux2': {
          host: {
            url: ''
          }
        }
      }
    },
    plugin: (evt, cb) => {
      const c = {
        toJson: () => ({
          assetsByChunkName: {}
        })
      };

      cb(c);
      cb(c);
    }
  };

  beforeEach(() => {
    called = false;
    spyOn(logger, 'info');
    mock('open', () => {
      called = true;
    });

    lib = require('../config/webpack/serve.webpack.config');
    config = lib.getWebpackConfig({
      CUSTOM_PROP3: true,
      'blackbaud-sky-pages-out-skyux2': {
        mode: ''
      }
    });
  });

  afterEach(() => {
    mock.stop('open');
    lib = null;
    config = null;
  });

  it('should expose a getWebpackConfig method', () => {
    expect(typeof lib.getWebpackConfig).toEqual('function');
  });

  it('should merge the common webpack config with overrides', () => {
    expect(config.SKY_PAGES.CUSTOM_PROP3).toEqual(true);
  });

  it('should display a ready message when done and open the url once', () => {
    config.plugins.forEach(plugin => {
      if (plugin.name === 'WebpackPluginDone') {
        pluginConfig.options.argv.noOpen = false;
        plugin.apply(pluginConfig);
      }
    });

    expect(logger.info).toHaveBeenCalledTimes(2);
    expect(called).toEqual(true);
  });

  it('should not open the url when done if noOpen option specified', () => {
    config.plugins.forEach(plugin => {
      if (plugin.name === 'WebpackPluginDone') {
        pluginConfig.options.argv.noOpen = true;
        plugin.apply(pluginConfig);
      }
    });

    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(called).toEqual(false);
  });

});
