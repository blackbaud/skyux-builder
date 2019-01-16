/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const logger = require('@blackbaud/skyux-logger');

describe('@skyux-sdk/builder', () => {
  let config;

  beforeEach(() => {
    config = mock.reRequire('../config/sky-pages/sky-pages.config');
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should expose a runCommand method', () => {
    const lib = mock.reRequire('../index');
    expect(typeof lib.runCommand).toEqual('function');
  });

  it('should handle known commands', () => {
    const lib = mock.reRequire('../index');
    const cmds = {
      'build': {
        cmd: 'build',
        lib: 'build'
      },
      'build-public-library': {
        cmd: 'build-public-library',
        lib: 'build-public-library'
      },
      'e2e': {
        cmd: 'e2e',
        lib: 'e2e'
      },
      'serve': {
        cmd: 'serve',
        lib: 'serve'
      },
      'lint': {
        cmd: 'lint',
        lib: 'lint'
      },
      'test': {
        cmd: 'test',
        lib: 'test'
      },
      'pact': {
        cmd: 'pact',
        lib: 'pact'
      },
      'watch': {
        cmd: 'watch',
        lib: 'test'
      },
      'version': {
        cmd: 'version',
        lib: 'version'
      },
      'generate': {
        cmd: 'generate',
        lib: 'generate'
      },
      'g': {
        cmd: 'generate',
        lib: 'generate'
      }
    };

    Object.keys(cmds).forEach((key) => {
      mock(`../cli/${cmds[key].lib}`, () => {
        cmds[key].called = true;
      });
      lib.runCommand(cmds[key].cmd, {});
      expect(cmds[key].called).toEqual(true);
    });
  });

  it('should return false for unknown command', () => {
    spyOn(logger, 'info');
    spyOn(config, 'getSkyPagesConfig');

    const cmd = 'junk-command-that-does-not-exist';
    const lib = mock.reRequire('../index');

    expect(lib.runCommand(cmd, {})).toEqual(false);
    expect(config.getSkyPagesConfig).not.toHaveBeenCalled();
  });

  it('should return true for known command', () => {
    spyOn(logger, 'info');
    spyOn(config, 'getSkyPagesConfig');

    const cmd = 'build';
    mock(`../cli/${cmd}`, () => {});

    const lib = mock.reRequire('../index');

    expect(lib.runCommand(cmd, {})).toBe(true);
    expect(config.getSkyPagesConfig).toHaveBeenCalled();
  });

  it('should process shorthand tags', (done) => {
    const argv = {
      l: 'showForLaunch',
      b: 'showForBrowser',
      f: 'showForForce'
    };
    mock('../cli/test', (c, a) => {
      expect(a.launch).toEqual(argv.l);
      expect(a.browser).toEqual(argv.b);
      expect(a.force).toEqual(argv.f);
      done();
    });
    const lib = mock.reRequire('../index');
    lib.runCommand('test', argv);
  });

});
