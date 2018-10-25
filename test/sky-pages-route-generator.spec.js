/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs');
const glob = require('glob');
const path = require('path');
const mock = require('mock-require');

describe('SKY UX Builder route generator', () => {
  let generator;

  beforeEach(() => {
    generator = mock.reRequire('../lib/sky-pages-route-generator');
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

    expect(suppliedPattern).toEqual(path.join('my-custom-src', 'my-custom-pattern'));
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
    spyOn(fs, 'readFileSync').and.returnValue(`@Injectable() export class Guard {
      public canActivate() {}
      public canDeactivate() {}
      public canActivateChild() {}
    }`);
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

    expect(routes.declarations).toContain(
      `canActivateChild: [Guard]`
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

    let file = path.join('my-custom-src', 'my-custom-route', 'index.guard.ts');
    expect(() => generator.getRoutes({
      runtime: {
        srcPath: 'my-custom-src/',
        routesPattern: 'my-custom-pattern',
      }
    })).toThrow(new Error(`As a best practice, only export one guard per file in ${file}`));
  });

  it('should handle top-level routes', () => {
    spyOn(glob, 'sync').and.callFake(() => ['my-custom-src/my-custom-route/index.html']);
    spyOn(path, 'join').and.returnValue('');
    const routes = generator.getRoutes({
      runtime: {
        srcPath: ''
      }
    });

    expect(routes.declarations).toContain(
      `path: 'my-custom-src/my-custom-route'`
    );
  });

  it('should handle child routes', () => {
    spyOn(glob, 'sync').and.callFake(() => ['my-custom-src/#my-custom-route/index.html']);
    spyOn(path, 'join').and.returnValue('');
    const routes = generator.getRoutes({
      runtime: {
        srcPath: ''
      }
    });

    expect(routes.declarations).toContain(
      `path: 'my-custom-src'`
    );

    expect(routes.declarations).toContain(
      `path: 'my-custom-route'`
    );
  });

  it('should handle nested child routes', () => {
    spyOn(glob, 'sync').and.callFake(() => ['my-custom-src/#my-custom-route/#nested/index.html']);
    spyOn(path, 'join').and.returnValue('');
    const routes = generator.getRoutes({
      runtime: {
        srcPath: ''
      }
    });

    // expect only one instance each of `my-custom-src` and `my-custom-route`
    // in the declarations
    expect(routes.declarations.match(/path\:\s\'my\-custom\-src\'/g).length).toBe(1);
    expect(routes.declarations.match(/path\:\s\'my\-custom\-route\'/g).length).toBe(1);
    expect(routes.declarations).toContain(
      `path: 'nested'`
    );
  });

  it('should merge child routes when necessary', () => {
    spyOn(glob, 'sync').and.callFake(() => [
      'my-custom-src/#my-custom-route/#nested/index.html',
      'my-custom-src/#my-custom-route/index.html',
      ''
    ]);
    spyOn(fs, 'readFileSync').and.returnValue(`@Injectable() export class Guard {
      public canActivate() {}
      public canDeactivate() {}
      public canActivateChild() {}
    }`);
    spyOn(fs, 'existsSync').and.returnValue(true);
    spyOn(path, 'join').and.returnValue('');
    const routes = generator.getRoutes({
      runtime: {
        srcPath: ''
      }
    });

    expect(routes.declarations).toContain(
      `path: 'my-custom-src'`
    );

    expect(routes.declarations).toContain(
      `path: 'my-custom-route'`
    );

    expect(routes.declarations).toContain(
      `path: 'nested'`
    );
  });

  it('should handle child routes with parameter', () => {
    spyOn(glob, 'sync').and.callFake(() => ['my-custom-src/#my-custom-route/_custom/index.html']);
    spyOn(path, 'join').and.returnValue('');
    spyOn(fs, 'readFileSync').and.returnValue('');
    spyOn(fs, 'existsSync').and.returnValue(true);

    const routes = generator.getRoutes({
      runtime: {
        srcPath: ''
      }
    });

    expect(routes.declarations).toContain(`path: 'my-custom-src'`);
    expect(routes.declarations).toContain(`path: 'my-custom-route'`);
    expect(routes.declarations).toContain(`path: ':custom'`);
    expect(routes.definitions).toContain(`this.custom = params['custom'];`);
  });

  it('should handle top-level routes within a child route', () => {
    spyOn(glob, 'sync').and.callFake(() => ['my-custom-src/#my-custom-route/top-level/index.html']);
    spyOn(path, 'join').and.returnValue('');
    const routes = generator.getRoutes({
      runtime: {
        srcPath: ''
      }
    });

    expect(routes.declarations).toContain(
      `path: 'my-custom-src/my-custom-route/top-level'`
    );
  });

  it('should publicly expose config variable to template', () => {
    spyOn(glob, 'sync').and.returnValue(['custom/nested/index.html']);
    spyOn(path, 'join').and.returnValue('');
    spyOn(fs, 'readFileSync').and.returnValue('');

    const routes = generator.getRoutes({
      runtime: {
        srcPath: ''
      }
    });
    expect(routes.definitions).toContain('public config: SkyAppConfig');
  });

  it('should prepend any redirects to the route declarations', () => {
    spyOn(glob, 'sync').and.returnValue(['custom/nested/index.html']);
    spyOn(path, 'join').and.returnValue('');
    spyOn(fs, 'readFileSync').and.returnValue('');

    const routes = generator.getRoutes({
      runtime: {
        srcPath: ''
      },
      skyux: {
        redirects: {
          'old': 'new'
        }
      }
    });

    const rootIndex = routes.declarations.indexOf(`path: ''`);
    const redirectIndex = routes.declarations.indexOf(`{
  path: 'old',
  redirectTo: 'new'
}`);

    expect(redirectIndex).toBeLessThan(rootIndex);
  });

  it('should add the NotFoundComponent if route does not exist', () => {
    spyOn(glob, 'sync').and.returnValue(['index.html']);
    spyOn(path, 'join').and.returnValue('');
    spyOn(fs, 'readFileSync').and.returnValue('');
    const routes = generator.getRoutes({
      runtime: {
        srcPath: '',
        handle404: true
      }
    });
    expect(routes.definitions).toContain(
      `template: \`<iframe src="https://host.nxt.blackbaud.com/errors/notfound"`
    );
  });
});
