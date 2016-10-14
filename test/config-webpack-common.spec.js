/*jshint jasmine: true, node: true */
'use strict';

const path = require('path');

describe('config webpack common', () => {
  it('should expose a getWebpackConfig method', () => {
    const lib = require('../config/webpack/common.webpack.config');
    expect(typeof lib.getWebpackConfig).toEqual('function');
  });

  it('should handle an advanced mode', () => {
    const lib = require('../config/webpack/common.webpack.config');
    const config = lib.getWebpackConfig({
      'blackbaud-sky-pages-out-skyux2': {
        mode: 'advanced'
      }
    });
    expect(config.entry.app[0]).toContain(process.cwd());
  });

  it('should look in the specified import path when resolving SKY UX', () => {
    const lib = require('../config/webpack/common.webpack.config');
    const importPath = './some-folder';

    const config = lib.getWebpackConfig({
      'blackbaud-sky-pages-out-skyux2': {
        mode: 'advanced',
        skyux: {
          importPath: importPath
        }
      }
    });

    const resolves = config.resolve.root;
    const lastResolve = resolves[resolves.length - 1];
    const expectedResolve = path.join(process.cwd(), importPath);

    expect(lastResolve).toBe(expectedResolve);
  });
});
