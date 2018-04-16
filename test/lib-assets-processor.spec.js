/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const path = require('path');

describe('SKY assets configuration module', () => {
  let skyPagesConfig;
  let mockLocaleProcessor;

  beforeEach(() => {
    skyPagesConfig = {
      runtime: {
        app: {
          base: '/base/'
        }
      }
    };

    mockLocaleProcessor = {
      isLocaleFile() {
        return false;
      },
      resolvePhysicalLocaleFilePath(filePath) {
        return filePath;
      },
      resolveRelativeLocaleFileDestination(filePath) {
        return filePath;
      }
    };

    mock('../utils/assets-utils', {
      getFilePathWithHash: function (filePath) {
        const dirname = path.dirname(filePath);
        const basename = path.basename(filePath);
        return `${dirname}/[HASH]${basename}`;
      }
    });

    mock('../lib/locale-assets-processor', mockLocaleProcessor);
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should set the base URL for the SKY assets loader rule', () => {
    const processor = mock.reRequire('../lib/assets-processor');
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
    const processor = mock.reRequire('../lib/assets-processor');
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
    const processor = mock.reRequire('../lib/assets-processor');
    const content = processor.processAssets(
      '~/assets/a/b/c.jpg',
      processor.getAssetsUrl(skyPagesConfig, 'https://example.com')
    );

    expect(content).toBe('https://example.com/base/assets/a/b/[HASH]c.jpg');
  });

  it('should handle trailing content after an asset match', () => {
    const processor = mock.reRequire('../lib/assets-processor');
    const content = processor.processAssets(
`<img src="~/assets/images/image.svg" (click)="someMethod()" [class.some-style="condition"]>
<img src="~/assets/measure.png" />, such as to compare their performance.`,
      processor.getAssetsUrl(skyPagesConfig, 'https://example.com')
    );

    expect(content).toBe(
      // jscs:disable maximumLineLength
`<img src="https://example.com/base/assets/images/[HASH]image.svg" (click)="someMethod()" [class.some-style="condition"]>
<img src="https://example.com/base/assets/[HASH]measure.png" />, such as to compare their performance.`
      // jscs:enable
    );
  });

  it('should remap locale files to their actual location on disk', () => {
    spyOn(mockLocaleProcessor, 'isLocaleFile').and.returnValue(true);
    const physicalLocationSpy = spyOn(mockLocaleProcessor, 'resolvePhysicalLocaleFilePath').and.callThrough();
    const relativeLocationSpy = spyOn(mockLocaleProcessor, 'resolveRelativeLocaleFileDestination').and.callThrough();

    const processor = mock.reRequire('../lib/assets-processor');

    processor.processAssets(
      '~/assets/resources_en_US.json',
      processor.getAssetsUrl(skyPagesConfig, 'https://example.com')
    );

    expect(physicalLocationSpy).toHaveBeenCalledWith('~/assets/resources_en_US.json');
    expect(relativeLocationSpy).toHaveBeenCalledWith('~/assets/[HASH]resources_en_US.json');
  });

});
