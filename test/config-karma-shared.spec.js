/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');

describe('config karma shared', () => {

  const testConfigFilename = '../config/webpack/test.webpack.config';

  afterAll(() => {
    mock.stopAll();
  });

  it('should load the webpack config', (done) => {
    let called = false;
    mock(testConfigFilename, {
      getWebpackConfig: () => {
        called = true;
        return {};
      }
    });

    mock.reRequire('../config/karma/shared.karma.conf')({
      set: (config) => {
        const collector = {
          getFinalCoverage: () => ({})
        };
        expect(called).toEqual(true);
        expect(typeof config.coverageReporter._onWriteReport).toEqual('function');
        expect(config.coverageReporter._onWriteReport(collector)).toBeDefined();
        done();
      }
    });
  });

  it('should pass the right command name to skyPagesConfig', (done) => {

    const customCommand = 'custom-command';
    spyOn(process.argv, 'slice').and.returnValue([customCommand]);

    mock(testConfigFilename, {
      getWebpackConfig: () => {}
    });

    mock('../config/sky-pages/sky-pages.config.js', {
      getSkyPagesConfig: (command) => {
        expect(command).toBe(customCommand);
        done();
      }
    });

    mock.reRequire('../config/karma/shared.karma.conf')({
      set: () => {}
    });
  });

});
