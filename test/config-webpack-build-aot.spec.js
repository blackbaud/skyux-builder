/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs');
const mock = require('mock-require');
const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');

describe('config webpack build-aot', () => {
  const ngtoolsWebpackPath = '@ngtools/webpack';

  beforeEach(() => {
    mock(ngtoolsWebpackPath, {
      AotPlugin: function () {

      }
    });
  });

  afterEach(() => {
    mock.stop(ngtoolsWebpackPath);
  });

  it('should expose a getWebpackConfig method', () => {
    const lib = require('../config/webpack/build-aot.webpack.config');
    expect(typeof lib.getWebpackConfig).toEqual('function');
  });

  it('should merge the common webpack config with overrides', () => {
    const f = './common.webpack.config';
    mock(f, {
      getWebpackConfig: () => ({})
    });

    const lib = require('../config/webpack/build-aot.webpack.config');

    const skyPagesConfig = {
      CUSTOM_PROP2: true
    };

    const config = lib.getWebpackConfig({
      CUSTOM_PROP2: true
    });

    config.plugins.forEach(plugin => {
      if (plugin.name === 'DefinePlugin') {
        expect(JSON.parse(plugin.options.SKY_PAGES)).toBe(skyPagesConfig.CUSTOM_PROP2);
      }
    });

    mock.stop(f);
  });

  it('should use the AoT entry module', () => {
    const f = './common.webpack.config';
    mock(f, {
      getWebpackConfig: () => ({})
    });

    const lib = require('../config/webpack/build-aot.webpack.config');

    const config = lib.getWebpackConfig({});

    expect(
      config.entry.app[0]
    ).toBe(skyPagesConfigUtil.spaPathTempSrc('main.aot.ts'));

    mock.stop(f);
  });

  it('should write metadata.json file and match entries order', () => {
    let json;
    spyOn(fs, 'writeFileSync').and.callFake((file, content) => {
      json = JSON.parse(content);
    });

    const lib = require('../config/webpack/build-aot.webpack.config');
    const config = lib.getWebpackConfig({
      mode: ''
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
                    'test1.js': {
                      source: () => {}
                    },
                    'test2.js': {
                      source: () => {}
                    },
                    'test3.js': {
                      source: () => {}
                    }
                  },
                  getStats: () => ({
                    toJson: () => ({
                      chunks: [
                        { id: 1, entry: false, names: ['test1'], parents: ['3'], files: ['test1.js'] },
                        { id: 2, entry: false, names: ['test2'], parents: ['3'], files: ['test2.js'] },
                        { id: 3, entry: true, names: ['test3'], files: ['test3.js'] }
                      ]
                    })
                  })
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
    expect(json[0].name).toEqual('test3.js');
    expect(json[1].name).toEqual('test1.js');
    expect(json[2].name).toEqual('test2.js');
  });

  it('should add the SKY_PAGES_READY_X variable to each entry', () => {
    const lib = require('../config/webpack/build-aot.webpack.config');
    const config = lib.getWebpackConfig({
      mode: ''
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
                  assets: assets,
                  getStats: () => ({
                    toJson: () => ({
                      chunks: [
                        { id: 1, entry: true, names: ['test'], files: ['test.js'] }
                      ]
                    })
                  })
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
