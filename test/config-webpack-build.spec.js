/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const runtimeUtils = require('../utils/runtime-test-utils');

describe('config webpack build', () => {
  let mockFsExtra;
  let mockWebpackConfig;

  beforeEach(() => {
    mockFsExtra = {
      existsSync() {},
      writeFileSync() {}
    };

    mockWebpackConfig = {
      module: {
        rules: []
      }
    };

    mock('fs-extra', mockFsExtra);

    mock('../config/webpack/common.webpack.config', {
      getWebpackConfig: () => {
        return mockWebpackConfig;
      }
    });
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should expose a getWebpackConfig method', () => {
    const lib = mock.reRequire('../config/webpack/build.webpack.config');
    expect(typeof lib.getWebpackConfig).toEqual('function');
  });

  it('should merge the common webpack config with overrides', () => {
    const lib = mock.reRequire('../config/webpack/build.webpack.config');

    const skyPagesConfig = {
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: {
        command: 'CUSTOM_COMMAND'
      }
    };

    const config = lib.getWebpackConfig(skyPagesConfig);

    config.plugins.forEach(plugin => {
      if (plugin.name === 'DefinePlugin') {
        const command = JSON.parse(plugin.options.skyPagesConfig).skyux.command;
        expect(command).toBe(skyPagesConfig.skyux.command);
      }
    });
  });

  it('should write metadata.json file and match entries order', () => {
    let json;

    const writeSpy = spyOn(mockFsExtra, 'writeFileSync').and.callFake((file, content) => {
      json = JSON.parse(content);
    });

    // Need to refresh cache in order to spy on fs-extra.
    mock.reRequire('../plugin/save-metadata');

    const lib = mock.reRequire('../config/webpack/build.webpack.config');
    const config = lib.getWebpackConfig({
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: {}
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

    expect(writeSpy).toHaveBeenCalled();

    // Host Utils reverses the scripts.
    expect(json[0].name).toEqual('test2.js');
    expect(json[1].name).toEqual('test1.js');
    expect(json[2].name).toEqual('test3.js');
  });

  it('should add the SKY_PAGES_READY_X variable to each entry', () => {

    const lib = mock.reRequire('../config/webpack/build.webpack.config');
    const config = lib.getWebpackConfig({
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: {}
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
