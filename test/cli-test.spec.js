/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const logger = require('winston');

describe('cli test', () => {

  function MockServer(config, onExit) {
    return {
      on: () => {},
      start: () => {}
    };
  }

  beforeEach(() => {
    spyOn(logger, 'info').and.returnValue();
    mock('../cli/utils/ts-linter', {
      lintSync: () => {
        return 0;
      }
    });
    mock('../config/sky-pages/sky-pages.config', {
      outPath: (path) => path
    });
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should load the test config when running test command', () => {
    let _configPath;
    mock('karma', {
      config: {
        parseConfig: (configPath) => _configPath = configPath
      },
      Server: MockServer
    });
    const test = require('../cli/test');
    test('test');
    expect(_configPath.indexOf('/test.karma.conf.js') > -1).toEqual(true);
  });

  it('should load the watch config when running watch command', () => {});

  it('should pass the current command to karma', () => {});

  it('should pass the --coverage flag to karma by default', () => {});

  it('should pass the --no-coverage flag to karma', () => {});

  it('should pass the exitCode', () => {});

});
