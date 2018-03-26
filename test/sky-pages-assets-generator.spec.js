/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const glob = require('glob');
// const fs = require('fs-extra');
const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');

describe('SKY UX Builder assets generator', () => {
  let generator;

  beforeEach(() => {
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should emit the expected code', () => {
    spyOn(skyPagesConfigUtil, 'spaPath').and.callFake((...args) => {
      const filePath = '/root/' + args.join('/');
      return filePath;
    });

    spyOn(glob, 'sync').and.callFake(() => {
      return [
        '/root/src/assets/a/b/c/d.jpg',
        '/root/src/assets/e/f.jpg'
      ];
    });

    generator = mock.reRequire('../lib/sky-pages-assets-generator');
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

});
