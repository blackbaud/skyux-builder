/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');

describe('SKY assets configuration module', () => {
  let processor;
  let skyPagesConfig;

  beforeEach(() => {
    skyPagesConfig = {
      runtime: {
        app: {
          base: '/base/'
        }
      }
    };

    mock('../utils/assets-utils', {
      getFilePathWithHash: function () {
        return 'a/b/c.abcdefg.jpg';
      }
    });

    processor = mock.reRequire('../lib/assets-processor');
  });

  afterEach(() => {
    mock.stopAll();
  });

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

    processor.setSkyAssetsLoaderUrl(
      config,
      skyPagesConfig,
      'https://localhost:5000'
    );

    expect(
      config.module.rules[1].options.baseUrl
    ).toBe('https://localhost:5000/base/');
  });

  it('should build an assets URL based on the app\'s root directory', () => {
    const url = processor.getAssetsUrl(
      {
        runtime: {
          app: {
            base: 'test'
          }
        }
      },
      'https://example.com/'
    );

    expect(url).toBe('https://example.com/test');
  });

  it('should process assets referenced in a file', () => {
    const content = processor.processAssets(
      '~/assets/a/b/c.jpg',
      processor.getAssetsUrl(skyPagesConfig, 'https://example.com')
    );

    expect(content).toBe('https://example.com/base/a/b/c.abcdefg.jpg');
  });

  it('should handle trailing content after an asset match', () => {
    const content = processor.processAssets(
`<img src="~/assets/images/image.svg" (click)="someMethod()" [class.some-style="condition"]>
<img src="~/assets/measure.png" />, such as to compare their performance.`,
      processor.getAssetsUrl(skyPagesConfig, 'https://example.com')
    );

    expect(content).toBe(
      // jscs:disable maximumLineLength
`<img src="https://example.com/base/a/b/c.abcdefg.jpg" (click)="someMethod()" [class.some-style="condition"]>
<img src="https://example.com/base/a/b/c.abcdefg.jpg" />, such as to compare their performance.`
      // jscs:enable
    );
  });

});
