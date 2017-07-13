/*jshint jasmine: true, node: true */
'use strict';

const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');

describe('SKY UX Builder assets generator', () => {
  let generator;

  beforeEach(() => {
    generator = require('../lib/sky-pages-assets-generator');
  });

  it('should emit the expected code', () => {
    const glob = require('glob');

    spyOn(skyPagesConfigUtil, 'spaPath').and.callFake((path1, path2) => {
      let spaPath = '/root/src';

      if (path2) {
        spaPath += '/assets';
      }

      return spaPath;
    });

    spyOn(glob, 'sync').and.returnValue([
      '/root/src/assets/a/b/c/d.jpg',
      '/root/src/assets/e/f.jpg'
    ]);

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
