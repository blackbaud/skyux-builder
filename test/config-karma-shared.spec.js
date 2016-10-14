/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');

describe('config karma shared', () => {

  it('should load the webpack config', (done) => {
    let called = false;
    const f = '../config/webpack/test.webpack.config';
    mock(f, {
      getWebpackConfig: () => {
        called = true;
        return {};
      }
    });

    require('../config/karma/shared.karma.conf')({
      set: (config) => {
        const collector = {
          getFinalCoverage: () => ({})
        };
        expect(called).toEqual(true);
        expect(typeof config.coverageReporter._onWriteReport).toEqual('function');
        expect(config.coverageReporter._onWriteReport(collector)).toBeDefined();
        mock.stop(f);
        done();
      }
    });
  });

});
