/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');

describe('Assets utilities', () => {

  beforeEach(() => {
    mock('hash-file', {
      sync: function () {
        return 'abcdefg';
      }
    });

    mock('../config/sky-pages/sky-pages.config', {
      spaPath: () => 'root'
    });
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should provide a method for appending a hash to the name of a file', () => {
    const assets = require('../utils/assets-utils');

    const filePathWithHash = assets.getFilePathWithHash('/root/a/b/c.jpg');

    expect(filePathWithHash).toBe('/a/b/c.abcdefg.jpg');
  });

  it('should provide a method for retrieving an asset URL', () => {
    const assets = require('../utils/assets-utils');

    const filePathWithHash = assets.getUrl('https://example.com', '/root/a/b/c.jpg');

    expect(filePathWithHash).toBe('https://example.com/a/b/c.abcdefg.jpg');
  });

});
