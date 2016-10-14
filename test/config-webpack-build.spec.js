/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs');
const mock = require('mock-require');

describe('config webpack build', () => {
  it('should expose a getWebpackConfig method', () => {
    const lib = require('../config/webpack/build.webpack.config');
    expect(typeof lib.getWebpackConfig).toEqual('function');
  });

  it('should merge the common webpack config with overrides', () => {
    const f = './common.webpack.config';
    mock(f, {
      getWebpackConfig: () => ({})
    });

    const lib = require('../config/webpack/build.webpack.config');
    const config = lib.getWebpackConfig({
      CUSTOM_PROP2: true,
      'blackbaud-sky-pages-out-skyux2': 'advanced'
    });
    expect(config.SKY_PAGES.CUSTOM_PROP2).toEqual(true);
    mock.stop(f);
  });

  it('should write stats to a stats.json file', () => {
    spyOn(fs, 'writeFileSync');

    const lib = require('../config/webpack/build.webpack.config');
    const config = lib.getWebpackConfig({
      'blackbaud-sky-pages-out-skyux2': {
        mode: ''
      }
    });

    config.plugins.forEach(plugin => {
      if (plugin.name === 'SaveStats') {
        plugin.apply({
          plugin: (evt, cb) => {
            cb({
              toJson: () => {}
            });
          }
        });
      }
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('should write metadata to a metadata.json file', () => {
    spyOn(fs, 'writeFileSync');

    const lib = require('../config/webpack/build.webpack.config');
    const config = lib.getWebpackConfig({
      'blackbaud-sky-pages-out-skyux2': {
        mode: ''
      }
    });

    config.plugins.forEach(plugin => {
      if (plugin.name === 'SaveMetadata') {
        plugin.apply({
          plugin: (evt, cb) => {
            switch (evt) {
              case 'emit':
                cb({
                  assets: {
                    test: {
                      source: () => {}
                    },
                    'test.js': {
                      source: () => {}
                    }
                  }
                }, () => {});
              break;
              case 'done':
                cb();
              break;
            }
          }
        });
      }
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('should add the SKY_PAGES_READY_X variable to each entry', () => {

    const lib = require('../config/webpack/build.webpack.config');
    const config = lib.getWebpackConfig({
      'blackbaud-sky-pages-out-skyux2': {
        mode: ''
      }
    });

    config.plugins.forEach(plugin => {
      if (plugin.name === 'SaveMetadata') {
        plugin.apply({
          plugin: (evt, cb) => {
            switch (evt) {
              case 'emit':
                let assets = {
                  'test.js': {
                    source: () => '// My Source'
                  }
                };

                cb({
                  assets: assets
                }, () => {});

                const source = assets['test.js'].source();
                expect(source).toContain('// My Source');
                expect(source).toContain('var SKY_PAGES_READY_TEST = true;');
              break;
            }
          }
        });
      }
    });
  });

});
