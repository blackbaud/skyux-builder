/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const logger = require('winston');

describe('sky-pages-out-skyux2', () => {

  it('should expose a runCommand method', () => {
    const lib = require('../index');
    expect(typeof lib.runCommand).toEqual('function');
  });

  it('should handle known commands', () => {
    const lib = require('../index');
    const cmds = [
      'build',
      'serve',
      'watch',
      'version'
    ];

    cmds.forEach((cmd) => {
      let called = false;
      mock('../cli/' + cmd, () => {
        called = true;
      });
      lib.runCommand(cmd);
      expect(called).toEqual(true);
    });
  });

  it('should handle unknown command', () => {
    spyOn(logger, 'info');
    const cmd = 'junk-command-that-does-not-exist';
    const lib = require('../index');
    lib.runCommand(cmd);
    expect(logger.info).toHaveBeenCalledWith(
      'sky-pages-out-skyux2: Unknown command %s',
      cmd
    );
  });

});
