/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const logger = require('../utils/logger');
const config = require('../config/sky-pages/sky-pages.config');

describe('@blackbaud/skyux-builder', () => {

  it('should expose a runCommand method', () => {
    const lib = require('../index');
    expect(typeof lib.runCommand).toEqual('function');
  });

  it('should handle known commands', () => {
    const lib = require('../index');
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
      }
    };

    Object.keys(cmds).forEach((key) => {
      mock('../cli/' + cmds[key].lib, () => {
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
    const lib = require('../index');

    expect(lib.runCommand(cmd, {})).toBe(false);
    expect(config.getSkyPagesConfig).not.toHaveBeenCalled();
  });

  it('should return true for known command', () => {
    spyOn(logger, 'info');
    spyOn(config, 'getSkyPagesConfig');

    const cmd = 'build';
    const lib = require('../index');

    expect(lib.runCommand(cmd, {})).toBe(true);
    expect(config.getSkyPagesConfig).toHaveBeenCalled();
  });

  it('should process shorthand tags', (done) => {
    const argv = {
      l: 'showForLaunch',
      b: 'showForBrowser'
    };
    mock('../cli/test', (c, a) => {
      expect(a.launch).toEqual(argv.l);
      expect(a.browser).toEqual(argv.b);
      done();
    });
    const lib = require('../index');
    lib.runCommand('test', argv);
  });

});
