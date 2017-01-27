/*jshint jasmine: true, node: true */
'use strict';

const path = require('path');
const mock = require('mock-require');
const logger = require('winston');
const selenium = require('selenium-standalone');

describe('cli e2e', () => {

  let returnSeleniumServer;
  let webpackDevServerCalled;
  let webpackDevServerClosed;
  let webpackCompiler;
  let spawnCmd;
  let spawnConfig;
  let spawnSyncCmd;
  let spawnSyncFlags;
  let spawnSyncConfig;
  let spawnExitCb;

  beforeEach(() => {
    returnSeleniumServer = true;
    webpackDevServerCalled = false;
    webpackDevServerClosed = false;
    webpackCompiler = null;
    spawnCmd = null;
    spawnConfig = null;
    spawnSyncCmd = null;
    spawnSyncFlags = null;
    spawnSyncConfig = null;
    spawnExitCb = null;

    spyOn(process, 'exit');

    mock('webpack-dev-server', function (compiler) {
      webpackDevServerCalled = true;
      webpackCompiler = compiler;
      return {
        listen: () => {},

        close: () => {
          webpackDevServerClosed = true;
        }
      };
    });

    mock('cross-spawn', {
      spawn: (cmd, config) => {
        spawnCmd = cmd;
        spawnConfig = config;
        return {
          on: (evt, cb) => {
            if (evt === 'exit') {
              spawnExitCb = cb;
            }
          }
        };
      },

      sync: (syncCmd, syncFlags, syncConfig) => {
        spawnSyncCmd = syncCmd;
        spawnSyncFlags = syncFlags;
        spawnSyncConfig = syncConfig;
      }
    });
  });

  afterEach(() => {
    mock.stop('webpack-dev-server');
    mock.stop('cross-spawn');
  });

  it('should spawn and close webpack dev server', () => {
    spyOn(logger, 'info');
    require('../cli/e2e')({});
    webpackCompiler.options.plugins.forEach((plugin) => {
      if (plugin.name === 'WebpackPluginDoneE2E') {
        plugin.apply({
          plugin: (evt, cb) => {
            cb();
            spawnExitCb();
            expect(logger.info).toHaveBeenCalledWith('Webpack server is ready.');
            expect(webpackDevServerCalled).toEqual(true);
            expect(webpackDevServerClosed).toEqual(true);
          }
        });
      }
    });
  });

  it('should pass launch none', () => {
    const configPath = '../config/webpack/serve.webpack.config';
    const config = require(configPath);
    let webpackConfigArgs;

    mock(configPath, {
      getWebpackConfig: (args, skyPagesConfig) => {
        webpackConfigArgs = args;
        return config.getWebpackConfig(args, skyPagesConfig);
      }
    });

    require('../cli/e2e')({ });
    expect(webpackConfigArgs.launch).toEqual('none');
    mock.stop(configPath);
  });

  it('should not spawn webpack dev server if noServe is true', () => {
    require('../cli/e2e')({ noServe: true });
    expect(webpackDevServerCalled).toEqual(false);
  });

  it('should spawn protractor', () => {
    spyOn(logger, 'info');
    require('../cli/e2e')({ noServe: true });

    expect(spawnCmd).toContain('protractor');
    expect(spawnConfig[0]).toContain('protractor.conf.js');
  });

  it('should install, start, and close selenium if seleniumAddress is given', () => {
    const configPath = path.resolve(
      __dirname,
      '..',
      'config',
      'protractor',
      'protractor.conf.js'
    );

    let cbInstall;
    let cbStart;
    let killed = false;

    spyOn(selenium, 'install').and.callFake((config, cb) => {
      cbInstall = cb;
    });
    spyOn(selenium, 'start').and.callFake((cb) => {
      cbStart = cb;
    });
    spyOn(logger, 'info');

    mock(configPath, {
      config: {
        seleniumAddress: 'asdf'
      }
    });

    require('../cli/e2e')({ noServe: true });
    cbInstall();
    cbStart(null, {
      kill: () => {
        killed = true;
      }
    });
    spawnExitCb();
    expect(selenium.install).toHaveBeenCalled();
    expect(selenium.start).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith('Selenium server is ready.');
    expect(logger.info).toHaveBeenCalledWith('Cleaning up running servers');
    expect(killed).toEqual(true);
    mock.stop(configPath);
  });

  it('should only kill the seleniumServer and webpackServer if they exist', () => {
    spyOn(logger, 'info');
    require('../cli/e2e')({ noServe: true });
    spawnExitCb();
    expect(logger.info).toHaveBeenCalledTimes(3);
  });

  it('should listen for SIGINT and kill the servers, defaulting to exit code 0', () => {
    spyOn(process, 'on').and.callFake((evt, cb) => {
      if (evt === 'SIGINT') {
        cb();
      }
    });
    require('../cli/e2e')({ noServe: true });
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  it('should pass through any exit code, except 199', () => {
    spyOn(process, 'on').and.callFake((evt, cb) => {
      if (evt === 'SIGINT') {
        cb(1337);
      }
    });
    require('../cli/e2e')({ noServe: true });
    expect(process.exit).toHaveBeenCalledWith(1337);
  });

  it('should catch exitCode 199', () => {
    spyOn(logger, 'warn');
    spyOn(process, 'on').and.callFake((evt, cb) => {
      if (evt === 'SIGINT') {
        cb(199);
      }
    });
    require('../cli/e2e')({ noServe: true });
    expect(process.exit).toHaveBeenCalledWith(0);
    expect(logger.warn).toHaveBeenCalled();
  });

});
