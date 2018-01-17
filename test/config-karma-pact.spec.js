/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const path = require('path');
const logger = require('../utils/logger');

describe('config karma pact', () => {
  const watchPath = '../config/karma/watch.karma.conf';
  const testPath = '../config/karma/test.karma.conf';
  let watchCalled = false;
  let testCalled = false;

  beforeEach(() => {

    const f = '../config/webpack/test.webpack.config';
    mock(f, {
      getWebpackConfig: () => {
        return {};
      }
    });

    mock(watchPath, () => {
      watchCalled = true;
    });
    mock(testPath, () => {
      testCalled = true;
    });

    mock('minimist', (options) => {

      return {
        "_": ['pact'],
        "watch": true
      }

    });

    mock('../config/sky-pages/sky-pages.config', {
      outPath: (path) => path,
      getSkyPagesConfig: (path) => {
        return {
          skyux: {
            pacts: [
              {
                "provider": "test-provider",
                "consumer": "test-consumer",
                "spec": 1
              }
            ]
          },
          runtime: {
            pactConfig: {

            }
          }
        }
      }
    });

    mock('../utils/pact-servers', {

      getPactProxyServer: () => {
        return 'http://localhost:1234';
      },
      getAllPactServers: () => {
        return {
          'test-provider': {
            "host": 'localhost',
            'port': '8000',
            'fullUrl': 'http://localhost:8000'
          }
        };
      },
      getPactServer: (provider) => {
        return {
          "host": 'localhost',
          'port': '8000',
          'fullUrl': 'http://localhost:8000'
        }
      }

    });

  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should load the watch config if watch command is given', (done) => {

    require('../config/karma/pact.karma.conf')({
      set: (config) => {
        expect(config.pact).toBeDefined();
        expect(watchCalled).toEqual(true);
        done();
      },
      frameworks: ['jasmine'],
      files: [],
      plugins: ['awesome-typescript-loader']
    });
  });

  it('should load the test config if watch command is not given', (done) => {

    mock.stop('minimist');
    mock('minimist', (options) => {

      return {
        "_": ['pact'],
        "watch": false
      }

    });
    require('../config/karma/pact.karma.conf')({
      set: (config) => {
        expect(config.pact).toBeDefined();
        expect(watchCalled).toEqual(true);
        done();
      },
      frameworks: ['jasmine'],
      files: [],
      plugins: ['awesome-typescript-loader']
    });
  });

  it('should add pact to frameworks', (done) => {
    require('../config/karma/pact.karma.conf')({
      set: (config) => {
        expect(config.frameworks).toEqual(['jasmine', 'pact']);
        expect(watchCalled).toEqual(true);
        done();
      },
      frameworks: ['jasmine'],
      files: [],
      plugins: ['awesome-typescript-loader']
    });
  });

  it('should add karma-pact to plugins', (done) => {
    require('../config/karma/pact.karma.conf')({
      set: (config) => {
        expect(config.plugins).toEqual(['awesome-typescript-loader', '@pact-foundation/karma-pact']);
        expect(watchCalled).toEqual(true);
        done();
      },
      frameworks: ['jasmine'],
      files: [],
      plugins: ['awesome-typescript-loader']
    });
  });

  it('should add pact-web.js to files', (done) => {
    require('../config/karma/pact.karma.conf')({
      set: (config) => {
        let pactPath = path.resolve(process.cwd(), 'node_modules/@pact-foundation/pact-web',
        `pact-web.js`);
        expect(config.files.indexOf(pactPath)).not.toEqual(-1);
        expect(watchCalled).toEqual(true);
        done();
      },
      frameworks: ['jasmine'],
      files: [],
      plugins: ['awesome-typescript-loader']
    });
  });

  it('should log error in sky pages config does not contain pacts', (done) => {

    mock.stop('../config/sky-pages/sky-pages.config');
    mock('../config/sky-pages/sky-pages.config', {
      outPath: (path) => path,
      getSkyPagesConfig: (path) => {
        return {
          skyux: {
          },
          runtime: {
            pactConfig: {

            }
          }
        }
      }
    });
    spyOn(logger, 'error').and.returnValue();
    require('../config/karma/pact.karma.conf')({
      set: (config) => {
        expect(config.pact).not.toBeDefined();
        expect(logger.error).toHaveBeenCalled();
        expect(watchCalled).toEqual(true);
        done();
      },
      frameworks: ['jasmine'],
      files: [],
      plugins: ['awesome-typescript-loader']
    });
  });

});
