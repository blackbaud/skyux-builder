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
  let mockAssetsGenerator;
  let mockRouteGenerator;
  let mockLogger;

  beforeEach(() => {
    mockComponentGenerator = {
      getComponents() {
        return {
          names: [],
          imports: ''
        };
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

    mockLogger = {
      warn() {}
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

    mockLogger = {
      warn() {}
    };

    mock('@blackbaud/skyux-logger', mockLogger);
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
      skyux: runtimeUtils.getDefaultSkyux()
    });
    expect(source).toBeDefined();
  });

  it('should import modules from the nodeModuleImports', () => {
    const generator = mock.reRequire(GENERATOR_PATH);
    const expectedImport = `import { CommonModule } from '@angular/common';`;

    let source = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: runtimeUtils.getDefaultSkyux()
    });

    expect(source).toContain(expectedImport);
  });

  it('should import modules from the runtimeModuleImports', () => {
    const generator = mock.reRequire(GENERATOR_PATH);
    const expectedImport = 'CommonModule';

    let source = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: runtimeUtils.getDefaultSkyux()
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
      skyux: runtimeUtils.getDefaultSkyux()
    });
    expect(source).toContain('NotFoundComponent');
    expect(source).not.toContain(
      `template: \`<iframe src="https://host.nxt.blackbaud.com/errors/notfound"`
    );
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
      skyux: runtimeUtils.getDefaultSkyux()
    });

    expect(source).toContain(
      `import {
  AppExtrasModule
} from '../src/app/app-extras.module';`
    );
  });

  it('should only provide the SkyAuthHttp service if the app is configured to use auth', () => {
    const generator = mock.reRequire(GENERATOR_PATH);
    const expectedImport = `{ SkyAuthHttp }`;
    const expectedProvider = `{
      provide: SkyAuthHttp,
      useClass: SkyAuthHttp,
      deps: [XHRBackend, RequestOptions, SkyAuthTokenProvider, SkyAppConfig]
    }`;

    let source = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: runtimeUtils.getDefaultSkyux()
    });

    expect(source).not.toContain(expectedImport);
    expect(source).not.toContain(expectedProvider);

    source = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: runtimeUtils.getDefaultSkyux({
        auth: true
      })
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
      skyux: runtimeUtils.getDefaultSkyux()
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
      skyux: runtimeUtils.getDefaultSkyux({
        help: {}
      })
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
      skyux: runtimeUtils.getDefaultSkyux()
    });

    let moduleImports = getModuleList('imports', sourceWithRouting);

    expect(moduleImports).toContain(expectedImport);

    const sourceWithoutRouting = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime({
        includeRouteModule: false
      }),
      skyux: runtimeUtils.getDefaultSkyux()
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
      skyux: runtimeUtils.getDefaultSkyux()
    });

    expect(source).toContain(
      `import { enableProdMode } from '@angular/core';
enableProdMode();`
    );
  });

  it('should put auth-client in mock mode if the command is e2e', () => {
    const generator = mock.reRequire(GENERATOR_PATH);
    let source = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime({
        command: 'e2e'
      }),
      skyux: runtimeUtils.getDefaultSkyux()
    });

    expect(source).toContain(
      `import { BBAuth } from '@blackbaud/auth-client';
BBAuth.mock = true;`
    );
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
      skyux: runtimeUtils.getDefaultSkyux()
    };

    const routeGeneratorGetRoutes = routeGenerator.getRoutes;
    spyOn(routeGenerator, 'getRoutes').and.callFake(() => {
      return routeGeneratorGetRoutes(config);
    });


    const source = generator.getSource(config);
    expect(source).toContain(JSON.stringify(config));
  });

  it('should add assets to skyPagesConfig.runtime', () => {
    const config = {
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: runtimeUtils.getDefaultSkyux()
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
      skyux: runtimeUtils.getDefaultSkyux({ useHashRouting: true })
    });

    expect(source).toContain('routing = RouterModule.forRoot(routes, { useHash: true });');
  });

  it('should not use Hash routing if option is not specified in the skyuxconfig', () => {
    const generator = mock.reRequire(GENERATOR_PATH);
    const source = generator.getSource({
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: runtimeUtils.getDefaultSkyux()
    });

    expect(source).toContain('routing = RouterModule.forRoot(routes, { useHash: false });');
  });

  it('should add SkyPactService and override AuthTokenProvider if calling pact command', () => {
    const generator = mock.reRequire(GENERATOR_PATH);
    let runtime = runtimeUtils.getDefaultRuntime();
    runtime.command = 'pact';

    let source = generator.getSource({
      runtime: runtime,
      skyux: runtimeUtils.getDefaultSkyux()
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

  it('should add require statements for style sheets', () => {
    const generator = mock.reRequire(GENERATOR_PATH);
    const expectedRequire = `
require('style-loader!@foo/bar/style.scss');
require('style-loader!src/styles/custom.css');
`;
    const config = {
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: runtimeUtils.getDefaultSkyux()
    };

    config.skyux.app = {
      styles: [
        '@foo/bar/style.scss',
        'src/styles/custom.css'
      ]
    };

    const source = generator.getSource(config);
    expect(source).toContain(expectedRequire);
  });

  it('should ignore external style sheets', () => {
    const generator = mock.reRequire(GENERATOR_PATH);
    const spy = spyOn(mockLogger, 'warn').and.callThrough();
    const expectedRequire = '';
    const config = {
      runtime: runtimeUtils.getDefaultRuntime(),
      skyux: runtimeUtils.getDefaultSkyux()
    };

    config.skyux.app = {
      styles: [
        'https://google.com/styles.css'
      ]
    };

    const source = generator.getSource(config);
    expect(source).toContain(expectedRequire);
    expect(source).not.toContain(`require('style-loader!https://google.com/styles.css');`);
    expect(spy.calls.first().args[0]).toContain('External style sheets are not permitted');
  });
});
