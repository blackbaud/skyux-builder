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

  it('should read name from sky-pages.json else package.json', () => {
    const name = 'sky-pages-name';
    const lib = require('../config/webpack/common.webpack.config');
    const config = lib.getWebpackConfig({
      name: name,
      'blackbaud-sky-pages-out-skyux2': {
        mode: 'advanced'
      }
    });
    expect(config.SKY_PAGES.name).toEqual(name);
  });

  it('should look in the specified import path when resolving SKY UX', () => {
    const lib = require('../config/webpack/common.webpack.config');
    const importPath = './some-folder';
    const cssPath = path.join(importPath, '/scss/sky.scss');

    let config = lib.getWebpackConfig({
      'blackbaud-sky-pages-out-skyux2': {
        mode: 'advanced',
        skyux: {
          importPath: importPath,
        }
      }
    });

    let alias = config.resolve.alias;

    expect(
      alias['blackbaud-skyux2/dist']
    ).toBe(path.join(process.cwd(), importPath));

    config = lib.getWebpackConfig({
      'blackbaud-sky-pages-out-skyux2': {
        mode: 'advanced',
        skyux: {
          cssPath: cssPath
        }
      }
    });

    alias = config.resolve.alias;

    expect(
      alias['blackbaud-skyux2/dist/css/sky.css']
    ).toBe(path.join(process.cwd(), cssPath));
  });
});
