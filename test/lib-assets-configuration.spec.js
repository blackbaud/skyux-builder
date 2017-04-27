/*jshint jasmine: true, node: true */
'use strict';

const assetsConfig = require('../lib/assets-configuration');

describe('SKY assets configuration module', () => {
  it('should set the base URL for the SKY assets loader rule', () => {
    const config = {
      module: {
        rules: [
          {
            enforce: 'pre',
            test: /\.(html|s?css)$/,
            loader: 'loader/something-else'
          },
          {
            enforce: 'pre',
            test: /\.(html|s?css)$/,
            loader: 'loader/sky-assets'
          }
        ]
      }
    };

    const skyPagesConfig = {
      runtime: {
        app: {
          base: '/base/'
        }
      }
    };

    assetsConfig.setSkyAssetsLoaderUrl(
      config,
      skyPagesConfig,
      'https://localhost:5000'
    );

    expect(
      config.module.rules[1].options.baseUrl
    ).toBe('https://localhost:5000/base/');
  });
});
