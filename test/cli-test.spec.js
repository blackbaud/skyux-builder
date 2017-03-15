/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');

describe('cli test', () => {

  it('should load the test config when running test command', () => {

    const cmd = 'test';
    let found = false;

    mock('cross-spawn', (node, flags) => {
      flags.forEach(flag => {
        if (flag.indexOf(cmd + '.karma.conf') > -1) {
          found = true;
        }
      });
    });

    require('../cli/test')(cmd);
    expect(found).toEqual(true);
    mock.stop('cross-spawn');

  });

  it('should load the watch config when running watch command', () => {

    const cmd = 'watch';
    let found = false;

    mock('cross-spawn', (node, flags) => {
      flags.forEach(flag => {
        if (flag.indexOf(cmd + '.karma.conf') > -1) {
          found = true;
        }
      });
    });

    require('../cli/test')(cmd);
    expect(found).toEqual(true);
    mock.stop('cross-spawn');

  });

  it('should pass the current command to karma', () => {

    const cmd = 'CUSTOM_CMD';
    let argv;

    const minimist = require('minimist');
    mock('cross-spawn', (node, flags) => {
      argv = minimist(flags);
    });

    require('../cli/test')(cmd);
    expect(argv.command).toEqual(cmd);
    mock.stop('cross-spawn');

  });

});
