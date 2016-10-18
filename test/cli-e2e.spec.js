/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');

describe('cli test', () => {

  it('should run protractor', () => {

    mock('cross-spawn', (cmd, config) => {
      expect(cmd).toContain('protractor');
      expect(config).toContain('protractor.conf.js');
    });

    require('../cli/e2e')();
    mock.stop('cross-spawn');

  });

});
