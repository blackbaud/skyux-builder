/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const runtimeUtils = mock.reRequire('../utils/runtime-test-utils.js');

const GENERATOR_PATH = '../lib/sky-pages-module-generator';

function getModuleList(listName, content) {
  const listRegExp = new RegExp(`${listName}:\\s\\[([\\s\\S]*?).*?\\]`, 'g');
  const list = content.match(listRegExp);
  return list ? list[0] : [];
}

describe('SKY UX Builder module generator', () => {
  let mockComponentGenerator;
  let mockCodeGenUtils;
  let mockAssetsGenerator;
  let mockRouteGenerator;

  beforeEach(() => {
    mockComponentGenerator = {
      getComponents() {
        return {
          names: [],
          imports: ''
        };
      }
    };

    mockCodeGenUtils = {
      indent() {
        return '    ';
      }
    };

    mockAssetsGenerator = {
      getClassName() {
        return 'MOCK_ASSETS_CLASS';
      },
      getSource() {
        return 'MOCK_ASSETS_SOURCE';
      }
    };

    mockRouteGenerator = {
      getRoutes() {
        return {
          declarations: '',
          definitions: '',
          imports: [],
          names: [],
          providers: '',
          routesForConfig: {}
        };
      }
    };

    mock('../utils/codegen-utils', mockCodeGenUtils);
    mock('../lib/sky-pages-assets-generator', mockAssetsGenerator);
    mock('../lib/sky-pages-component-generator', mockComponentGenerator);
    mock('../lib/sky-pages-route-generator', mockRouteGenerator);
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should return a source string', () => {
    const generator = mock.reRequire(GENERATOR_PATH);
    const source = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: {}
    });
    expect(source).toBeDefined();
  });

  it('should import modules from the nodeModuleImports', () => {
    const generator = mock.reRequire(GENERATOR_PATH);
    const expectedImport = `import { CommonModule } from '@angular/common';`;

    let source = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: {}
    });

    expect(source).toContain(expectedImport);
  });

  it('should export modules from the runtimeModuleExports', () => {
    const generator = mock.reRequire(GENERATOR_PATH);
    const expectedExport = 'SkyAppRuntimeModule';

    const source = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: {}
    });

    const moduleExports = getModuleList('exports', source);

    expect(moduleExports).toContain(expectedExport);
  });

  it('should import modules from the runtimeModuleImports', () => {
    const generator = mock.reRequire(GENERATOR_PATH);
    const expectedImport = 'CommonModule';

    let source = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: {}
    });

    let moduleImports = getModuleList('imports', source);

    expect(moduleImports).toContain(expectedImport);
  });

  it('should not add the NotFoundComponent if it exists', () => {
    const generator = mock.reRequire(GENERATOR_PATH);
    const source = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime({
        components: [
          {
            importPath: 'not-found.component.ts',
            componentName: 'NotFoundComponent'
          }
        ]
      }),
      skyux: {}
    });
    expect(source).toContain('NotFoundComponent');
    expect(source).not.toContain("template: '<sky-error errorType=\"notfound\"></sky-error>'");
  });

  it('should handle 404', () => {
    spyOn(mockComponentGenerator, 'getComponents').and.returnValue({
      names: ['NotFoundComponent']
    });
    const generator = mock.reRequire(GENERATOR_PATH);
    const config = {
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: {}
    };
    const source = generator.getSource(config);
    expect(source).toContain('NotFoundComponent');
    expect(config.runtime.handle404).toBeUndefined();
  });

  it('should allow the SKY UX Builder out alias to be overridden', () => {
    const generator = mock.reRequire(GENERATOR_PATH);
    const source = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime({
        skyPagesOutAlias: '..'
      }),
      skyux: {}
    });

    expect(source).toContain(
      `import {
  AppExtrasModule
} from '../src/app/app-extras.module';`
    );
  });

  it('should allow the SKY UX path alias to be overridden', () => {
    const generator = mock.reRequire(GENERATOR_PATH);
    const source = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime({
        skyuxPathAlias: 'custom'
      }),
      skyux: {}
    });

    expect(source).toContain(
      `import { SkyModule } from 'custom/core';`
    );
  });

  it('should only provide the SkyAuthHttp service if the app is configured to use auth', () => {
    const generator = mock.reRequire(GENERATOR_PATH);
    // Other items can exist so we're leaving out "import""
    const expectedImport = `, SkyAuthHttp } from 'sky-pages-internal/runtime';`;

    const expectedProvider = `{
      provide: SkyAuthHttp,
      useClass: SkyAuthHttp,
      deps: [XHRBackend, RequestOptions, SkyAuthTokenProvider, SkyAppConfig]
    }`;

    let source = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: {}
    });

    expect(source).not.toContain(expectedImport);
    expect(source).not.toContain(expectedProvider);

    source = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: {
        auth: true
      }
    });

    expect(source).toContain(expectedImport);
    expect(source).toContain(expectedProvider);
  });

  it('should not add BBHelpModule if the help config does not exists.', () => {
    const generator = mock.reRequire(GENERATOR_PATH);
    const expectedModule = 'BBHelpModule';
    const expectedNodeModule = `import { BBHelpModule } from '@blackbaud/skyux-lib-help';`;

    let source = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: {}
    });

    let moduleImports = getModuleList('imports', source);
    let moduleExports = getModuleList('exports', source);

    expect(source).not.toContain(expectedNodeModule);
    expect(moduleImports).not.toContain(expectedModule);
    expect(moduleExports).not.toContain(expectedModule);
  });

  it('should add BBHelpModule if the help config exists.', () => {
    const generator = mock.reRequire(GENERATOR_PATH);
    const expectedModule = 'BBHelpModule';
    const expectedNodeModule = `import { BBHelpModule } from '@blackbaud/skyux-lib-help';`;

    let source = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: {
        help: {}
      }
    });

    let moduleImports = getModuleList('imports', source);
    let moduleExports = getModuleList('exports', source);

    expect(source).toContain(expectedNodeModule);
    expect(moduleImports).toContain(expectedModule);
    expect(moduleExports).toContain(expectedModule);
  });

  it('should not include routing in the module imports if includeRouteModule is false', () => {
    const generator = mock.reRequire(GENERATOR_PATH);
    const expectedImport = `routing`;
    let sourceWithRouting = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: {}
    });

    let moduleImports = getModuleList('imports', sourceWithRouting);

    expect(moduleImports).toContain(expectedImport);

    let sourceWithoutRouting = generator.getSource(
      {
        runtime: runtimeUtils.getDefaultRuntime({
          includeRouteModule: false
        }),
        skyux: {}
      });

    moduleImports = getModuleList('imports', sourceWithoutRouting);

    expect(moduleImports).not.toContain(expectedImport);
  });

  it('should call `enableProdMode` if the command is build', () => {
    const generator = mock.reRequire(GENERATOR_PATH);
    let source = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime({
        command: 'build'
      }),
      skyux: {}
    });

    expect(source).toContain(
      `import { enableProdMode } from '@angular/core';
enableProdMode();`);
  });

  it('should put auth-client in mock mode if the command is e2e', () => {
    const generator = mock.reRequire(GENERATOR_PATH);
    let source = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime({
        command: 'e2e'
      }),
      skyux: {}
    });

    expect(source).toContain(
      `import { BBAuth } from '@blackbaud/auth-client';
BBAuth.mock = true;`);
  });

  it('should add routes to skyPagesConfig.runtime', () => {
    const generator = mock.reRequire(GENERATOR_PATH);
    const routeGenerator = require('../lib/sky-pages-route-generator');
    const config = {
      runtime: runtimeUtils.getDefaultRuntime({
        routes: [{
          routePath: 'fake-path',
          routeParams: [
            'fake-param'
          ]
        }]
      }),
      skyux: {}
    };

    const routeGeneratorGetRoutes = routeGenerator.getRoutes;
    spyOn(routeGenerator, 'getRoutes').and.callFake(() => {
      return routeGeneratorGetRoutes(config);
    });


    const source = generator.getSource(config);
    expect(source).toContain(JSON.stringify(config));
  });

  // it('should add assets to skyPagesConfig.runtime', () => {
  //   const generator = mock.reRequire(GENERATOR_PATH);
  //   const assetsGenerator = require('../lib/sky-pages-assets-generator');
  //   const skyPagesConfigUtil = require('../config/sky-pages/sky-pages.config');
  //   const config = {
  //     runtime: runtimeUtils.getDefaultRuntime({
  //       routes: [{
  //         routePath: 'fake-path',
  //         routeParams: [
  //           'fake-param'
  //         ]
  //       }]
  //     }),
  //     skyux: {
  //       params: {}
  //     }
  //   };

  //   spyOn(skyPagesConfigUtil, 'spaPath').and.callFake((...args) => '/root/src' + args.join('/'));

  //   const glob = require('glob');

  //   spyOn(glob, 'sync').and.callFake((path) => {
  //     if (path.indexOf('assets') >= 0) {
  //       return [
  //         '/root/src/assets/a/b/c/d.jpg',
  //         '/root/src/assets/e/f.jpg'
  //       ];
  //     }

  //     return [];
  //   });

  //   const assetsSource = assetsGenerator.getSource();
  //   const source = generator.getSource(config);

  //   expect(source).toContain(assetsSource);

  //   expect(source).toContain(`{
  //     provide: SkyAppAssetsService,
  //     useClass: SkyAppAssetsImplService
  //   }`);
  // });

  it('should add assets to skyPagesConfig.runtime', () => {
    const config = {
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: {}
    };

    const generator = mock.reRequire(GENERATOR_PATH);
    const assetsSource = mockAssetsGenerator.getSource();
    const source = generator.getSource(config);

    expect(source).toContain(assetsSource);

    expect(source).toContain(`{
      provide: SkyAppAssetsService,
      useClass: MOCK_ASSETS_CLASS
    }`);
  });

  it('should use Hash routing if specified in the skyuxconfig', () => {
    const generator = mock.reRequire(GENERATOR_PATH);
    const source = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: { useHashRouting: true }
    });

    expect(source).toContain('routing = RouterModule.forRoot(routes, { useHash: true });');
  });

  it('should not use Hash routing if option is not specified in the skyuxconfig', () => {
    const generator = mock.reRequire(GENERATOR_PATH);
    const source = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: {}
    });

    expect(source).toContain('routing = RouterModule.forRoot(routes, { useHash: false });');
  });

  it('adds SkyPactService and overrides AuthTokenProvider if calling pact command', () => {
    const generator = mock.reRequire(GENERATOR_PATH);
    let runtime = runtimeUtils.getDefaultRuntime();
    runtime.command = 'pact';

    let source = generator.getSource({
      runtime: runtime,
      skyux: {

      }
    });

    expect(source).toContain(`provide: SkyPactService`);
    expect(source).toContain(`useClass: SkyPactService`);
    expect(source).toContain(`deps: [SkyAppConfig]`);
    expect(source).toContain('SkyPactAuthTokenProvider');
    expect(source).toContain('SkyPactService');
    expect(source).toContain(`{
      provide: SkyAuthTokenProvider,
      useClass: SkyPactAuthTokenProvider
    }`);
  });


});
