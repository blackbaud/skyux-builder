/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const glob = require('glob');
const path = require('path');
const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');

describe('SKY UX Builder assets generator', () => {
  let mockLocaleProcessor;

  beforeEach(() => {
    mockLocaleProcessor = {
      isLocaleFile() {
        return false;
      }
    };

    mock('../lib/locale-assets-processor', mockLocaleProcessor);

    spyOn(skyPagesConfigUtil, 'spaPath').and.callFake((...args) => {
      return '/root/' + args.join('/');
    });
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should emit the expected code', () => {
    spyOn(glob, 'sync').and.callFake(() => {
      return [
        '/root/src/assets/a/b/c/d.jpg',
        '/root/src/assets/e/f.jpg'
      ];
    });

    const generator = mock.reRequire('../lib/sky-pages-assets-generator');
    const source = generator.getSource();

    expect(source).toBe(
`export class ${generator.getClassName()} {
  public getUrl(filePath: string): string {
    const pathMap: {[key: string]: any} = {
      'a/b/c/d.jpg': '~/assets/a/b/c/d.jpg',
      'e/f.jpg': '~/assets/e/f.jpg'
    };

    return pathMap[filePath];
  }
}`
    );
  });

  it('should handle merged locale files', () => {
    spyOn(mockLocaleProcessor, 'isLocaleFile').and.returnValue(true);
    spyOn(glob, 'sync').and.callFake(() => {
      return [
        '/root/src/assets/locales/resources_en_US.json',
        '/root/src/assets/locales/resources_fr_CA.json'
      ];
    });

    const generator = mock.reRequire('../lib/sky-pages-assets-generator');
    const source = generator.getSource();

    expect(source).toBe(
`export class SkyAppAssetsImplService {
  public getUrl(filePath: string): string {
    const pathMap: {[key: string]: any} = {
      '${path.join('locales', 'resources_en_US.json')}': '${path.join('~', 'assets', 'resources_en_US.json')}',
      '${path.join('locales', 'resources_fr_CA.json')}': '${path.join('~', 'assets', 'resources_fr_CA.json')}'
    };

    return pathMap[filePath];
  }
}`
    );
  });
});
