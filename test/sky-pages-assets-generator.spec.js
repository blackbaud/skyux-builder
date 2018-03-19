/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const glob = require('glob');
const fs = require('fs-extra');
const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');

describe('SKY UX Builder assets generator', () => {
  let generator;

  beforeEach(() => {
    generator = mock.reRequire('../lib/sky-pages-assets-generator');
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should emit the expected code', () => {
    spyOn(fs, 'readJSONSync').and.callFake(() => {
      return {
        'my_foo': {
          'message': 'Foo'
        }
      };
    });

    spyOn(skyPagesConfigUtil, 'spaPath').and.callFake((...args) => {
      let spaPath = '/root/';
      return spaPath += args.join('/');
    });

    spyOn(glob, 'sync').and.callFake((expression) => {
      if (expression.indexOf('node_modules') > -1) {
        return [
          '/dist/src/assets/locales/resources_en_FR.json'
        ];
      }

      if (expression.indexOf('locales') > -1) {
        return [
          '/root/src/assets/locales/resources_en_FR.json'
        ];
      }

      return [
        '/root/src/assets/a/b/c/d.jpg',
        '/root/src/assets/e/f.jpg'
      ];
    });

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

  public getResourcesForLocale(locale: string): any {
    const resources: {[key: string]: any} = {"en_FR":{"my_foo":{"message":"Foo"}}};
    return resources[locale];
  }
}`
    );
  });

});
