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

      return {
        on: () => {}
      };
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

      return {
        on: () => {}
      };
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

      return {
        on: () => {}
      };
    });

    require('../cli/test')(cmd);
    expect(argv.command).toEqual(cmd);
    mock.stop('cross-spawn');

  });

  it('should pass the --coverage flag to karma by default', () => {
    const cmd = 'CUSTOM_CMD';
    let found = false;

    mock('cross-spawn', (node, flags) => {
      found = flags.includes('--coverage');
      return {
        on: () => {}
      };
    });

    require('../cli/test')(cmd);
    expect(found).toEqual(true);
    mock.stop('cross-spawn');
  });

  it('should pass the --no-coverage flag to karma', () => {
    const cmd = 'CUSTOM_CMD';
    let found = false;

    mock('cross-spawn', (node, flags) => {
      found = flags.includes('--no-coverage');
      return {
        on: () => {}
      };
    });

    require('../cli/test')(cmd, { coverage: false });
    expect(found).toEqual(true);
    mock.stop('cross-spawn');
  });

  it('should pass the exitCode', (done) => {
    const EXIT_CODE = 1337;

    spyOn(process, 'exit').and.callFake(exitCode => {
      expect(exitCode).toEqual(EXIT_CODE);
      done();
    });

    mock('cross-spawn', () => ({
      on: (cmd, callback) => {
        if (cmd === 'exit') {
          callback(EXIT_CODE);
        }
      }
    }));

    require('../cli/test')('test');
    mock.stop('cross-spawn');

  });

});
