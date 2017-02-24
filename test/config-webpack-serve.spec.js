/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs');
const mock = require('mock-require');
const logger = require('winston');
const urlLibrary = require('url');

describe('config webpack serve', () => {

  const skyuxConfig = {
    CUSTOM_PROP3: true,
    mode: '',
    host: {
      url: 'https://my-host-server.url'
    },
    app: {
      externals: {
        test: true
      }
    }
  };

  let lib;
  let called;
  let openCalledWith;
  let config;
  let argv = {};

  function getPluginOptions() {
    return {
      appConfig: {
        base: 'my-custom-base'
      },
      devServer: {
        port: 1234
      }
    };
  }

  beforeEach(() => {
    called = false;
    openCalledWith = '';
    argv = {};

    spyOn(logger, 'info');
    mock('open', (url) => {
      called = true;
      openCalledWith = url;
    });

    lib = require('../config/webpack/serve.webpack.config');
    config = lib.getWebpackConfig(argv, skyuxConfig);
  });

  afterEach(() => {
    mock.stop('open');
    lib = null;
    config = null;
  });

  it('should expose a getWebpackConfig method', () => {
    expect(typeof lib.getWebpackConfig).toEqual('function');
  });

  it('should only log the ready message once during multiple dones', () => {
    config.plugins.forEach(plugin => {
      if (plugin.name === 'WebpackPluginDone') {
        plugin.apply({
          options: getPluginOptions(),
          plugin: (evt, cb) => {
            if (evt === 'done') {
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

    // Once for ready and once for default launching host
    expect(logger.info).toHaveBeenCalledTimes(2);
  });

  it('should log the host url and launch it when launch flag is not present', () => {
    config.plugins.forEach(plugin => {
      if (plugin.name === 'WebpackPluginDone') {
        plugin.apply({
          options: getPluginOptions(),
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

    expect(logger.info).toHaveBeenCalledTimes(2);
    expect(openCalledWith).toContain(
      'https://my-host-server.url/@blackbaud/skyux-builder/?local=true&_cfg='
    );
  });

  it('should log the host url and launch it when --launch host', () => {
    argv.launch = 'host';
    config.plugins.forEach(plugin => {
      if (plugin.name === 'WebpackPluginDone') {
        plugin.apply({
          options: getPluginOptions(),
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

    expect(logger.info).toHaveBeenCalledTimes(2);
    expect(openCalledWith).toContain('https://my-host-server.url');
  });

  it('should log the local url and launch it when --launch local', () => {
    argv.launch = 'local';
    config.plugins.forEach(plugin => {
      if (plugin.name === 'WebpackPluginDone') {
        plugin.apply({
          options: getPluginOptions(),
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

    expect(logger.info).toHaveBeenCalledTimes(2);
    expect(openCalledWith).toContain('https://localhost:1234');
  });

  it('should log a done message and not launch it when --launch none', () => {
    argv.launch = 'none';
    config.plugins.forEach(plugin => {
      if (plugin.name === 'WebpackPluginDone') {
        plugin.apply({
          options: getPluginOptions(),
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

    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(called).toEqual(false);
  });

  it('should pass shorthand -l as --launch flag', () => {
    argv.l = 'none';
    config.plugins.forEach(plugin => {
      if (plugin.name === 'WebpackPluginDone') {
        plugin.apply({
          options: getPluginOptions(),
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

    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(called).toEqual(false);
  });

  it('host querystring should not contain externals if they do not exist', () => {
    const localConfig = lib.getWebpackConfig(argv, { host: { url: '' } });
    localConfig.plugins.forEach(plugin => {
      if (plugin.name === 'WebpackPluginDone') {
        plugin.apply({
          options: getPluginOptions(),
          plugin: (evt, cb) => {
            if (evt === 'emit') {
              const done = () => {};
              const compilation = {};

              cb(compilation, done);
            }

            if (evt === 'done') {
              cb({
                toJson: () => ({
                  chunks: []
                })
              });
              const urlParsed = urlLibrary.parse(openCalledWith, true);
              const configString = new Buffer.from(urlParsed.query._cfg, 'base64').toString();
              const configObject = JSON.parse(configString);

              expect(urlParsed.query._cfg).toBeDefined();
              expect(configObject.externals).not.toBeDefined();
            }
          }
        });
      }
    });
  });

  it('host querystring should contain externals (if they exist), scripts, and localUrl', () => {

    config.plugins.forEach(plugin => {
      if (plugin.name === 'WebpackPluginDone') {
        plugin.apply({
          options: getPluginOptions(),
          plugin: (evt, cb) => {
            if (evt === 'emit') {
              const done = () => {};
              const compilation = {};

              cb(compilation, done);
            }

            if (evt === 'done') {
              cb({
                toJson: () => ({
                  chunks: [
                    { files: ['a.js'] },
                    { files: ['b.js'] }
                  ]
                })
              });
              const urlParsed = urlLibrary.parse(openCalledWith, true);
              const configString = new Buffer.from(urlParsed.query._cfg, 'base64').toString();
              const configObject = JSON.parse(configString);

              expect(urlParsed.query._cfg).toBeDefined();
              expect(configObject.externals).toEqual(skyuxConfig.app.externals);
              expect(configObject.localUrl).toContain('https://localhost:1234');
              expect(configObject.scripts).toEqual([
                { name: 'a.js' },
                { name: 'b.js' }
              ]);
            }
          }
        });
      }
    });
  });

});
