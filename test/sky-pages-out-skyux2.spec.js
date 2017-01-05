/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const logger = require('winston');

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
      'e2e': {
        cmd: 'e2e',
        lib: 'e2e'
      },
      'serve': {
        cmd: 'serve',
        lib: 'serve'
      },
      'test': {
        cmd: 'test',
        lib: 'test'
      },
      'watch': {
        cmd: 'watch',
        lib: 'test'
      },
      'version': {
        cmd: 'version',
        lib: 'version'
      }
    };

    Object.keys(cmds).forEach((key) => {
      mock('../cli/' + cmds[key].lib, () => {
        cmds[key].called = true;
      });
      lib.runCommand(cmds[key].cmd);
      expect(cmds[key].called).toEqual(true);
    });
  });

  it('should handle unknown command', () => {
    spyOn(logger, 'info');
    const cmd = 'junk-command-that-does-not-exist';
    const lib = require('../index');
    lib.runCommand(cmd);
    expect(logger.info).toHaveBeenCalledWith(
      '@blackbaud/skyux-builder: Unknown command %s',
      cmd
    );
  });

});
