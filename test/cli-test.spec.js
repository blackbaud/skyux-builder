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

});
