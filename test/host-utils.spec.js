/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');

describe('host-utils', () => {

  const skyPagesConfig = {
    host: {
      url: 'base.com'
    }
  };

  function decode(url) {
    return JSON.parse(Buffer.from(url.split('_cfg=')[1], 'base64'));
  }

  let utils;
  beforeEach(() => {
    mock('html-webpack-plugin/lib/chunksorter', {
      dependency: (chunks) => chunks
    });
    utils = require('../utils/host-utils');
  });

  afterEach(() => {
    utils = null;
    mock.stop('html-webpack-plugin/lib/chunksorter');
  });

  it('should resolve a url with a querystring', () => {
    const resolved = utils.resolve('/url?q=1', '', [], skyPagesConfig);
    expect(resolved).toContain(`base.com/url?q=1&local=true&_cfg=`);
  });

  it('should resolve a url with a querystring', () => {
    const resolved = utils.resolve('/url', '', [], skyPagesConfig);
    expect(resolved).toContain(`base.com/url?local=true&_cfg=`);
  });

  it('should add scripts / chunks', () => {

    const resolved = utils.resolve('/url', '', [{ files: ['test.js'] }], skyPagesConfig);
    const decoded = decode(resolved);

    expect(resolved).toContain(`base.com/url?local=true&_cfg=`);
    expect(decoded.scripts).toEqual([{ name: 'test.js' }]);
  });

  it('should add externals', () => {
    const externals = {
      js: [{
        head: true,
        url: 'myjs.com'
      }]
    };
    const resolved = utils.resolve('/url', '', [], {
      app: {
        externals: externals
      },
      host: {
        url: 'base.com'
      }
    });
    const decoded = decode(resolved);

    expect(resolved).toContain(`base.com/url?local=true&_cfg=`);
    expect(decoded.externals).toEqual(externals);
  });

});
