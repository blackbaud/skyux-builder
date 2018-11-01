/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs');
const mock = require('mock-require');
const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');
const runtimeUtils = require('../utils/runtime-test-utils');

describe('config webpack build-aot', () => {
  const ngtoolsWebpackPath = '@ngtools/webpack';

  beforeEach(() => {
    mock(ngtoolsWebpackPath, {
      AngularCompilerPlugin: function () {

      }
    });
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should expose a getWebpackConfig method', () => {
    const lib = require('../config/webpack/build-aot.webpack.config');
    expect(typeof lib.getWebpackConfig).toEqual('function');
  });

  // it('should merge the common webpack config with overrides', () => {
  //   const f = '../config/webpack/common.webpack.config';
  //   mock(f, {
  //     getWebpackConfig: () => ({ module: { rules: [] } })
  //   });

  //   const lib = require('../config/webpack/build-aot.webpack.config');

  //   const skyPagesConfig = {
  //     runtime: runtimeUtils.getDefaultRuntime({
  //       command: 'CUSTOM_COMMAND'
  //     }),
  //     skyux: {}
  //   };

  //   const config = lib.getWebpackConfig(skyPagesConfig);

  //   config.plugins.forEach(plugin => {
  //     if (plugin.name === 'DefinePlugin') {
  //       const command = JSON.parse(plugin.options.skyPagesConfig.runtime.command);
  //       expect(command).toBe(skyPagesConfig.runtime.command);
  //     }
  //   });

  //   mock.stop(f);
  // });

  it('should use the AoT entry module', () => {
    const f = '../config/webpack/common.webpack.config';
    mock(f, {
      getWebpackConfig: () => ({ module: { rules: [] } })
    });

    const lib = require('../config/webpack/build-aot.webpack.config');

    const config = lib.getWebpackConfig({
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: {}
    });

    expect(
      config.entry.app[0]
    ).toBe(skyPagesConfigUtil.spaPathTempSrc('main-internal.aot.ts'));

    mock.stop(f);
  });

  it('should write metadata.json file and match entries order', () => {
    let json;
    spyOn(fs, 'writeFileSync').and.callFake((file, content) => {
      json = JSON.parse(content);
    });

    const lib = require('../config/webpack/build-aot.webpack.config');
    const config = lib.getWebpackConfig({
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: {
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
                    'test1.js': {
                      source: () => {}
                    },
                    'test2.js': {
                      source: () => {}
                    },
                    'test3.js': {
                      source: () => {}
                    }
                  }
                }, () => {});
              break;
              case 'done':
                cb({
                  toJson: () => ({
                    chunks: [
                      {
                        id: 1,
                        entry: false,
                        names: ['test1'],
                        parents: ['3'],
                        files: ['test1.js']
                      },
                      {
                        id: 2,
                        entry: false,
                        names: ['test2'],
                        parents: ['3'],
                        files: ['test2.js']
                      },
                      {
                        id: 3,
                        entry: true,
                        names: ['test3'],
                        files: ['test3.js']
                      }
                    ]
                  })
                });
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

  it('should add the SKY_PAGES_READY_X variable to each entry, replacing periods', () => {
    const lib = require('../config/webpack/build-aot.webpack.config');
    const config = lib.getWebpackConfig({
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: {
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
                  'a.b.c.js': {
                    source: () => '// My Source'
                  }
                };

                cb({
                  assets: assets,
                  getStats: () => ({
                    toJson: () => ({
                      chunks: [
                        { id: 1, entry: true, names: ['a.b.c'], files: ['a.b.c.js'] }
                      ]
                    })
                  })
                }, () => {});

                const source = assets['a.b.c.js'].source();
                expect(source).toContain('// My Source');
                expect(source).toContain('var SKY_PAGES_READY_A_B_C = true;');
              break;
            }
          }
        });
      }
    });
  });

  it('should remove the sky-processor loader from the rules array', () => {
    const f = '../config/webpack/common.webpack.config';
    const loaderName = '/sky-processor/';
    mock(f, {
      getWebpackConfig: () => ({
        module: {
          rules: [
            {
              loader: 'test-loader'
            },
            {
              loader: loaderName
            }
          ]
        }
      })
    });

    const lib = require('../config/webpack/build-aot.webpack.config');

    const skyPagesConfig = {
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: {}
    };

    const config = lib.getWebpackConfig(skyPagesConfig);

    let found = false;

    config.module.rules.forEach((rule) => {
      if (found) {
        return;
      }

      found = (rule.loader && rule.loader.indexOf(loaderName) > -1);
    });

    expect(found).toEqual(false);
    expect(config.module.rules.length).toEqual(2);
  });

  it('should remove the sky-processor loader from the rules array (on Windows)', () => {
    const f = '../config/webpack/common.webpack.config';
    const loaderName = '\\sky-processor\\';
    mock(f, {
      getWebpackConfig: () => ({
        module: {
          rules: [
            {
              loader: 'test-loader'
            },
            {
              loader: loaderName
            }
          ]
        }
      })
    });

    const lib = require('../config/webpack/build-aot.webpack.config');

    const skyPagesConfig = {
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: {}
    };

    const config = lib.getWebpackConfig(skyPagesConfig);

    let found = false;

    config.module.rules.forEach((rule) => {
      if (found) {
        return;
      }

      found = (rule.loader && rule.loader.indexOf(loaderName) > -1);
    });

    expect(found).toEqual(false);
    expect(config.module.rules.length).toEqual(2);
  });

});
