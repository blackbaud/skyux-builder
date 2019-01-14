/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs-extra');
const glob = require('glob');
const mock = require('mock-require');
const sass = require('node-sass');

describe('cli utils prepare-library-package', () => {
  let util;

  beforeEach(() => {
    spyOn(fs, 'copySync').and.returnValue();
    spyOn(fs, 'removeSync').and.returnValue();
    mock('../config/sky-pages/sky-pages.config', {
      spaPath: () => '',
      spaPathTempSrc: (...fragments) => ['src'].concat(fragments).join('/'),
      spaPathTemp: (...fragments) => fragments.join('/')
    });
    util = require('../cli/utils/stage-library-ts');
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should return a function', () => {
    expect(typeof util).toEqual('function');
  });

  it('should copy source files from the public folder', () => {
    spyOn(glob, 'sync').and.returnValue([]);
    util();
    expect(fs.copySync).toHaveBeenCalled();
  });

  it('should delete non-dist files', () => {
    const spy = spyOn(glob, 'sync').and.callFake((pattern) => {
      if (pattern.match('.spec.')) {
        return ['index.spec.ts'];
      }

      return [];
    });

    util();
    expect(fs.removeSync).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith('/**/*.ts');
  });

  it('should fetch file contents for html and css files within angular components', () => {
    let finalContents;

    const spy = spyOn(glob, 'sync').and.callFake(pattern => {
      if (pattern.match('.spec.')) {
        return [];
      }

      return ['index.component.ts'];
    });

    spyOn(fs, 'readFileSync').and.callFake(filePath => {
      if (filePath === 'index.component.ts') {
        return `
          @Component({
            templateUrl: 'template.component.html',
            styleUrls: ['template.component.scss']
          })
          export class SampleComponent { }
        `;
      }

      if (filePath === 'template.component.html') {
        return '<p></p>';
      }
    });
    spyOn(fs, 'writeFileSync').and.callFake((file, contents) => {
      finalContents = contents;
    });

    spyOn(sass, 'renderSync').and.returnValue({
      css: 'p { color: black; }'
    });

    util();
    expect(finalContents.match('<p></p>')).not.toEqual(null);
    expect(finalContents.match('p { color: black; }')).not.toEqual(null);
    expect(spy).toHaveBeenCalledWith('/**/*.ts');
  });

  it('should handle multiline styleUrls array', () => {
    let finalContents;

    spyOn(glob, 'sync').and.callFake(pattern => {
      if (pattern.match('.spec.')) {
        return [];
      }

      return ['index.component.ts'];
    });

    spyOn(fs, 'readFileSync').and.callFake(filePath => {
      if (filePath === 'index.component.ts') {
        return `
          @Component({
            templateUrl: 'template.component.html',
            styleUrls: [
              'template.component.scss'
            ]
          })
          export class SampleComponent { }
        `;
      }

      if (filePath === 'template.component.html') {
        return '<p></p>';
      }
    });

    spyOn(fs, 'writeFileSync').and.callFake((file, contents) => {
      finalContents = contents;
    });

    spyOn(sass, 'renderSync').and.returnValue({
      css: 'p { color: black; }'
    });

    util();
    expect(finalContents.match('p { color: black; }')).not.toEqual(null);
  });

  it('should handle multiline styleUrls array', () => {
    let finalContents;

    spyOn(glob, 'sync').and.callFake(pattern => {
      if (pattern.match('.spec.')) {
        return [];
      }

      return ['index.component.ts'];
    });

    spyOn(fs, 'readFileSync').and.callFake(filePath => {
      if (filePath === 'index.component.ts') {
        return `
          @Component({
            templateUrl: 'template.component.html',
            styleUrls: [
              'template.component.scss'
            ]
          })
          export class SampleComponent { }
        `;
      }

      if (filePath === 'template.component.html') {
        return '<p></p>';
      }
    });

    spyOn(fs, 'writeFileSync').and.callFake((file, contents) => {
      finalContents = contents;
    });

    spyOn(sass, 'renderSync').and.returnValue({
      css: 'p { color: black; }'
    });

    util();
    expect(finalContents.match('p { color: black; }')).not.toEqual(null);
  });
});
