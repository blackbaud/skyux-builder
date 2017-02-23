/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');

describe('host-utils', () => {

  const skyPagesConfig = {
    name: 'my-spa-name',
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

  it('should resolve a url, trim trailing slash from host and leading slash from url', () => {
    const resolved = utils.resolve('/url?q=1', '', [], {
      name: 'cool-spa',
      host: {
        url: 'my-base.com/'
      }
    });
    expect(resolved).toContain(`my-base.com/cool-spa/url?q=1&local=true&_cfg=`);
  });

  it('should resolve a url without a querystring', () => {
    const resolved = utils.resolve('url', '', [], skyPagesConfig);
    expect(resolved).toContain(`base.com/my-spa-name/url?local=true&_cfg=`);
  });

  it('should resolve a url with a querystring', () => {
    const resolved = utils.resolve('/url?q=1', '', [], skyPagesConfig);
    expect(resolved).toContain(`base.com/my-spa-name/url?q=1&local=true&_cfg=`);
  });

  it('should add scripts / chunks', () => {

    const resolved = utils.resolve('/url', '', [{ files: ['test.js'] }], skyPagesConfig);
    const decoded = decode(resolved);

    expect(resolved).toContain(`base.com/my-spa-name/url?local=true&_cfg=`);
    expect(decoded.scripts).toEqual([{ name: 'test.js' }]);
  });

  it('should add externals, trim slash from host, and read name from package.json', () => {
    mock('../package.json', {
      name: 'my-name'
    });

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
        url: 'base.com/' // Testing this goes away
      }
    });
    const decoded = decode(resolved);

    expect(resolved).toContain(`base.com/my-name/url?local=true&_cfg=`);
    expect(decoded.externals).toEqual(externals);
    mock.stop('../package.json');
  });

});
