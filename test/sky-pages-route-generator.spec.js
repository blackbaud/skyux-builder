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
      srcPath: ''
    });
    expect(routes.names).toContain('SPR_0_IndexComponent');
  });

  it('should support route parameters', () => {
    spyOn(glob, 'sync').and.returnValue(['_custom/index.html']);
    spyOn(path, 'join').and.returnValue('');
    spyOn(fs, 'readFileSync').and.returnValue('');

    const routes = generator.getRoutes({
      srcPath: ''
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
      srcPath: ''
    });

    expect(routes.declarations).not.toContain("path: ':custom'");
  });

  it('should use the templateUrl property when useTemplateUrl is specified', () => {
    spyOn(glob, 'sync').and.returnValue(['custom/nested/index.html']);
    spyOn(path, 'join').and.returnValue('');
    spyOn(fs, 'readFileSync').and.returnValue('');

    const routes = generator.getRoutes({
      srcPath: '',
      spaPathAlias: 'custom-spa-path',
      useTemplateUrl: true
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
      srcPath: 'my-src/'
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
      srcPath: 'my-custom-src/',
      routesPattern: 'my-custom-pattern',
    });

    expect(suppliedPattern).toEqual('my-custom-src/my-custom-pattern');
  });

});
