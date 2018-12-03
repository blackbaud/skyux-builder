/*jshint jasmine: true, node: true */
'use strict';

const path = require('path');
const proxyquire = require('proxyquire');
const logger = require('@blackbaud/skyux-logger');

describe('cli version', () => {
  it('should return the version from package.json', () => {
    spyOn(logger, 'info');
    const version = 'this.should.match';

    let stubs = {};
    stubs[path.join(__dirname, '..', 'package.json')] = {
      '@noCallThru': true,
      version: version
    };

    proxyquire('../cli/version', stubs)();
    expect(logger.info).toHaveBeenCalledWith(
      '@skyux-sdk/builder: %s',
      version
    );
  });
});
