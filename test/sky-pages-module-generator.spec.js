/*jshint jasmine: true, node: true */
'use strict';

describe('SKY UX Builder module generator', () => {

  let generator;
  beforeEach(() => {
    generator = require('../lib/sky-pages-module-generator');
  });

  it('should return a source string', () => {
    const source = generator.getSource({});
    expect(source).toBeDefined();
  });

  it('should add the NotFoundComponent if it does not exist', () => {
    const source = generator.getSource({});
    expect(source).toContain("template: '404'");
  });

  it('should not add the NotFoundComponent if it exists', () => {
    const source = generator.getSource({
      components: [
        {
          importPath: 'not-found.component.ts',
          componentName: 'NotFoundComponent'
        }
      ]
    });
    expect(source).toContain('NotFoundComponent');
    expect(source).not.toContain("template: '404'");
  });

  it('should allow the SKY UX Builder out alias to be overridden', () => {
    const source = generator.getSource({
      skyPagesOutAlias: '..'
    });

    expect(source).toContain(
      `import { AppExtrasModule } from '../src/app/app-extras.module';`
    );
  });

  it('should allow the SKY UX path alias to be overridden', () => {
    const source = generator.getSource({
      skyuxPathAlias: '../../..'
    });

    expect(source).toContain(
      `import { SkyModule } from '../../../core';`
    );
  });

  it('should set bootstrap config if the applicable SKY UX settings exist', () => {
    let source = generator.getSource({
      auth: true
    });

    expect(source).toContain(
`SkyAppBootstrapper.bootstrapConfig = {
  omnibar: undefined,
  auth: true,
  help: undefined,
  publicRoutes: undefined
};`
    );

    source = generator.getSource({
      omnibar: {
        serviceName: 'Test'
      }
    });

    expect(source).toContain(
`SkyAppBootstrapper.bootstrapConfig = {
  omnibar: {"serviceName":"Test"},
  auth: undefined,
  help: undefined,
  publicRoutes: undefined
};`
    );

    source = generator.getSource({
      omnibar: {
        serviceName: 'Test'
      },
      publicRoutes: [
        {
          name: 'Home',
          route: '/',
          global: true
        }
      ]
    });

    expect(source).toContain(
`SkyAppBootstrapper.bootstrapConfig = {
  omnibar: {"serviceName":"Test"},
  auth: undefined,
  help: undefined,
  publicRoutes: [{"name":"Home","route":"/","global":true}]
};`
    );
  });

  it('should only provide the SkyAuthHttp service if the app is configured to use auth', () => {
    const expectedImport = `import { SkyAuthHttp } from 'sky-pages-internal/runtime';`;

    const expectedProvider = `
    ,{
      provide: SkyAuthHttp,
      useClass: SkyAuthHttp,
      deps: [XHRBackend, RequestOptions]
    }`;

    let source = generator.getSource({});

    expect(source).not.toContain(expectedImport);
    expect(source).not.toContain(expectedProvider);

    source = generator.getSource({
      auth: true
    });

    expect(source).toContain(expectedImport);
    expect(source).toContain(expectedProvider);
  });
});
