/*jshint jasmine: true, node: true */
'use strict';

const url = require('url');
const mock = require('mock-require');
const merge = require('../utils/merge');
const logger = require('@blackbaud/skyux-logger');

const hostUtils = require('../utils/host-utils');
const runtimeUtils = require('../utils/runtime-test-utils');

describe('browser utils', () => {

  let openCalled;
  let openParamUrl;
  let openParamBrowser;

  beforeEach(() => {
    openCalled = false;
    openParamUrl = '';
    openParamBrowser = undefined;

    mock('opn', (url, options) => {
      openCalled = true;
      openParamUrl = url;
      openParamBrowser = options.app;
    });

    spyOn(logger, 'info');
  });

  afterEach(() => {
    mock.stopAll();
  });

  function bind(settings) {
    const merged = merge({
      argv: {},
      skyPagesConfig: runtimeUtils.getDefault(),
      stats: {
        toJson: () => ({
          chunks: []
        })
      },
      port: ''
    }, settings);

    mock.reRequire('../cli/utils/browser')(
      merged.argv,
      merged.skyPagesConfig,
      merged.stats,
      merged.port
    );

    return merged;
  }

  function testLaunchHost(argv) {
    const port = 1234;
    const appBase = 'app-base';

    const settings = bind({
      argv: argv,
      port: port,
      skyPagesConfig: {
        runtime: runtimeUtils.getDefaultRuntime,
        skyux: runtimeUtils.getDefaultSkyux({
          name: appBase
        })
      }
    });

    const localUrl = `https://localhost:${port}/${appBase}/`;
    const hostUrl = hostUtils.resolve(
      '',
      localUrl,
      [],
      settings.skyPagesConfig
    );

    return {
      hostUrl: hostUrl,
      localUrl: localUrl
    };
  }

  it('should run envid and svcid through encodeURIComponent', () => {
    const s = bind({
      argv: {
        launch: 'host',
        envid: '&=$',
        svcid: '^%'
      }
    });

    expect(openParamUrl).toContain(
      `?envid=${encodeURIComponent(s.argv.envid)}&svcid=${encodeURIComponent(s.argv.svcid)}`
    );
  });

  it('should pass through envid and svcid, but not other flags from the command line', () => {
    const settings = bind({
      argv: {
        launch: 'host',
        envid: 'my-envid',
        svcid: 'my-svcid',
        noid: 'nope'
      }
    });

    const parsed = url.parse(openParamUrl, true);
    expect(parsed.query.envid).toBe(settings.argv.envid);
    expect(parsed.query.svcid).toBe(settings.argv.svcid);
    expect(parsed.query.noid).not.toBeDefined();
  });

  it(
    'should pass through envid and svcid, but not other flags from the command line when ' + 'config specifies a params object',
    () => {
      const settings = bind({
        argv: {
          launch: 'host',
          envid: 'my-envid',
          svcid: 'my-svcid',
          noid: 'nope'
        },
        skyPagesConfig: {
          skyux: {
            params: {
              envid: true,
              svcid: {
                value: 'abc'
              },
              noid: false
            }
          }
        }
      });

      const parsed = url.parse(openParamUrl, true);
      expect(parsed.query.envid).toBe(settings.argv.envid);
      expect(parsed.query.svcid).toBe(settings.argv.svcid);
      expect(parsed.query.noid).not.toBeDefined();
    }
  );

  it('should default --launch to host', () => {
    const urls = testLaunchHost({});
    expect(logger.info).toHaveBeenCalledWith(`Launching Host URL: ${urls.hostUrl}`);
    expect(openCalled).toBe(true);
    expect(openParamUrl).toBe(urls.hostUrl);
  });

  it('should log the host url and launch it when --launch host', () => {
    const urls = testLaunchHost({ launch: 'host' });
    expect(logger.info).toHaveBeenCalledWith(`Launching Host URL: ${urls.hostUrl}`);
    expect(openCalled).toBe(true);
    expect(openParamUrl).toBe(urls.hostUrl);
  });

  it('should log the local url and launch it when --launch local', () => {

    const port = 1234;
    const appBase = 'app-base';
    const url = `https://localhost:${port}/${appBase}/`;

    bind({
      argv: {
        launch: 'local'
      },
      port: port,
      skyPagesConfig: {
        runtime: runtimeUtils.getDefaultRuntime,
        skyux: runtimeUtils.getDefaultSkyux({
          name: appBase
        })
      }
    });

    expect(logger.info).toHaveBeenCalledWith(`Launching Local URL: ${url}`);
    expect(openCalled).toBe(true);
    expect(openParamUrl).toBe(url);
  });

  it('should log the local + host urls but not launch when --launch none', () => {
    const urls = testLaunchHost({ launch: 'none' });
    expect(logger.info).toHaveBeenCalledWith(`Host URL: ${urls.hostUrl}`);
    expect(logger.info).toHaveBeenCalledWith(`Local URL: ${urls.localUrl}`);
    expect(openCalled).not.toBe(true);
  });

  it('should pass --browser flag to open', () => {
    const settings = {
      argv: {
        browser: 'custom-browser',
        launch: 'host'
      }
    };

    bind(settings);
    expect(openCalled).toBe(true);
    expect(openParamBrowser).toEqual(settings.argv.browser);
  });

  it('should handle --browser edge different syntax', () => {
    bind({
      argv: {
        browser: 'edge',
        launch: 'host'
      }
    });
    expect(openParamBrowser).not.toBeDefined();
    expect(openParamUrl.indexOf('microsoft-edge')).toBe(0);
  });

});
