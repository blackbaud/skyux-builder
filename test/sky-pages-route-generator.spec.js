/*jshint jasmine: true, node: true */
'use strict';

describe('SKY UX Builder route generator', () => {

  const fs = require('fs');
  const glob = require('glob');
  const path = require('path');
  let generator;

  beforeEach(() => {
    generator = require('../lib/sky-pages-route-generator');
  });

  it('should auto generate a component name', () => {
    spyOn(glob, 'sync').and.returnValue(['custom/nested/index.html']);
    spyOn(path, 'join').and.returnValue('');
    spyOn(fs, 'readFileSync').and.returnValue('');

    const routes = generator.getRoutes({
      runtime: {
        srcPath: ''
      }
    });
    expect(routes.names).toContain('SPR_0_IndexComponent');
  });

  it('should support route parameters', () => {
    spyOn(glob, 'sync').and.returnValue(['_custom/index.html']);
    spyOn(path, 'join').and.returnValue('');
    spyOn(fs, 'readFileSync').and.returnValue('');

    const routes = generator.getRoutes({
      runtime: {
        srcPath: ''
      }
    });

    expect(routes.declarations).toContain("path: ':custom'");
    expect(routes.definitions).toContain("this.custom = params['custom'];");
    expect(routes.definitions).toContain(
      'class SPR_0_IndexComponent implements OnInit, OnDestroy {'
    );
  });

  it('should not generate route params if underscore is not first character', () => {
    spyOn(glob, 'sync').and.returnValue(['my_custom_folder/index.html']);
    spyOn(path, 'join').and.returnValue('');
    spyOn(fs, 'readFileSync').and.returnValue('');

    const routes = generator.getRoutes({
      runtime: {
        srcPath: ''
      }
    });

    expect(routes.declarations).not.toContain("path: ':custom'");
  });

  it('should use the templateUrl property when useTemplateUrl is specified', () => {
    spyOn(glob, 'sync').and.returnValue(['custom/nested/index.html']);
    spyOn(path, 'join').and.returnValue('');
    spyOn(fs, 'readFileSync').and.returnValue('');

    const routes = generator.getRoutes({
      runtime: {
        srcPath: '',
        spaPathAlias: 'custom-spa-path',
        useTemplateUrl: true
      }
    });
    expect(routes.definitions).toContain(
      `templateUrl: 'custom-spa-path/custom/nested/index.html'`
    );
  });

  it('should remove the srcPath when defining a route path', () => {
    spyOn(glob, 'sync').and.returnValue(['my-src/custom/nested/index.html']);
    spyOn(path, 'join').and.returnValue('');
    spyOn(fs, 'readFileSync').and.returnValue('');

    const routes = generator.getRoutes({
      runtime: {
        srcPath: 'my-src/'
      }
    });
    expect(routes.declarations).not.toContain('my-src/');
  });

  it('should support a custom routesPattern', () => {
    let suppliedPattern;
    spyOn(glob, 'sync').and.callFake((p) => {
      suppliedPattern = p;
      return ['my-custom-src/my-custom-route/index.html'];
    });

    generator.getRoutes({
      runtime: {
        srcPath: 'my-custom-src/',
        routesPattern: 'my-custom-pattern',
      }
    });

    expect(suppliedPattern).toEqual('my-custom-src/my-custom-pattern');
  });

  it('should handle windows guard paths correctly', () => {
    spyOn(glob, 'sync').and.callFake(() => ['my-src\\my-custom-route\\index.html']);
    spyOn(fs, 'readFileSync').and.returnValue('@Injectable() export class Guard {}');
    spyOn(fs, 'existsSync').and.returnValue(true);

    let routes = generator.getRoutes({
      runtime: {
        srcPath: 'my-src',
        routesPattern: '**/index.html'
      }
    });

    expect(routes.imports[0]).toContain(
      `my-src/my-custom-route/index.guard`
    );
  });

  it('should prefix guard imports with spaPathAlias', () => {
    spyOn(glob, 'sync').and.callFake(() => ['my-src/my-custom-route/index.html']);
    spyOn(fs, 'readFileSync').and.returnValue('@Injectable() export class Guard {}');
    spyOn(fs, 'existsSync').and.returnValue(true);

    let routes = generator.getRoutes({
      runtime: {
        srcPath: '',
        routesPattern: '**/index.html',
        spaPathAlias: 'spa-path-alias'
      }
    });

    expect(routes.imports[0]).toContain(
      `import { Guard } from \'spa-path-alias/my-src/my-custom-route/index.guard\';`
    );
  });

  it('should support guards with custom routesPattern', () => {
    spyOn(glob, 'sync').and.callFake(() => ['my-custom-src/my-custom-route/index.html']);
    spyOn(fs, 'readFileSync').and.returnValue('@Injectable() export class Guard {}');
    spyOn(fs, 'existsSync').and.returnValue(true);

    let routes = generator.getRoutes({
      runtime: {
        srcPath: 'my-custom-src/',
        routesPattern: 'my-custom-pattern',
      }
    });

    expect(routes.declarations).toContain(
      `canActivate: [Guard]`
    );

    expect(routes.declarations).toContain(
      `canDeactivate: [Guard]`
    );

    expect(routes.providers).toContain(
      `Guard`
    );
  });

  it('should throw when a file has multiple guards', () => {
    spyOn(glob, 'sync').and.callFake(() => ['my-custom-src/my-custom-route/index.html']);
    spyOn(fs, 'existsSync').and.returnValue(true);
    spyOn(fs, 'readFileSync').and.returnValue(`
      @Injectable() export class Guard {}
      @Injectable() export class Guard2 {}
    `);

    let file = 'my-custom-src/my-custom-route/index.guard.ts';
    expect(() => generator.getRoutes({
      runtime: {
        srcPath: 'my-custom-src/',
        routesPattern: 'my-custom-pattern',
      }
    })).toThrow(new Error(`As a best practice, only export one guard per file in ${file}`));
  });
});
