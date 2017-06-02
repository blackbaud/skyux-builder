/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const logger = require('winston');
const urlLibrary = require('url');
const runtimeUtils = require('../utils/runtime-test-utils');

describe('config webpack serve', () => {

  const skyuxConfig = {
    runtime: runtimeUtils.getDefaultRuntime(),
    skyux: runtimeUtils.getDefaultSkyux({
      app: {
        externals: {
          test: true
        }
      },
      host: {
        url: 'https://my-host-server.url'
      }
    })
  };

  let lib;
  let called;
  let openParamUrl;
  let openParamBrowser;
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
    openParamUrl = '';
    openParamBrowser = undefined;

    argv = {};

    spyOn(logger, 'info');
    mock('open', (url, browser) => {
      called = true;
      openParamUrl = url;
      openParamBrowser = browser;
    });

    lib = require('../config/webpack/serve.webpack.config');
    config = lib.getWebpackConfig(argv, skyuxConfig);
  });

  afterEach(() => {
    mock.stop('open');
    lib = null;
    config = null;
  });

  function bindToDone() {
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
  }

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
    expect(openParamUrl).toContain(
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
    expect(openParamUrl).toContain('https://my-host-server.url');
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
    expect(openParamUrl).toContain('https://localhost:1234');
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
    const localConfig = lib.getWebpackConfig(argv, {
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: runtimeUtils.getDefaultSkyux()
    });

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
              const urlParsed = urlLibrary.parse(openParamUrl, true);
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
              const urlParsed = urlLibrary.parse(openParamUrl, true);
              const configString = new Buffer.from(urlParsed.query._cfg, 'base64').toString();
              const configObject = JSON.parse(configString);

              expect(urlParsed.query._cfg).toBeDefined();
              expect(configObject.externals).toEqual(skyuxConfig.skyux.app.externals);
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

  it('should pass through envid from the command line', () => {
    argv.envid = 'asdf';

    bindToDone();
    expect(openParamUrl).toContain(`?envid=asdf`);
  });

  it('should pass through svcid from the command line', () => {
    argv.svcid = 'asdf';

    bindToDone();
    expect(openParamUrl).toContain(`?svcid=asdf`);
  });

  it('should run envid and svcid through encodeURIComponent', () => {
    argv.envid = '&=$';
    argv.svcid = '^%';

    bindToDone();
    expect(openParamUrl).toContain(
      `?envid=${encodeURIComponent(argv.envid)}&svcid=${encodeURIComponent(argv.svcid)}`
    );
  });

  it('should pass through envid and svcid, but not other flags from the command line', () => {
    argv.envid = 'asdf1';
    argv.svcid = 'asdf2';
    argv.myid = 'asdf3';

    bindToDone();
    expect(openParamUrl).toContain(`?envid=asdf1&svcid=asdf2`);
    expect(openParamUrl).not.toContain(`myid=asdf3`);
  });

  it('should pass --browser flag to open', () => {
    argv.browser = 'custom-browser';
    bindToDone();
    expect(openParamBrowser).toEqual(argv.browser);
  });

  it('should handle --browser edge different syntax', () => {
    argv.browser = 'edge';
    bindToDone();
    expect(openParamBrowser).not.toBeDefined();
    expect(openParamUrl.indexOf('microsoft-edge')).toBe(0);
  });

});
