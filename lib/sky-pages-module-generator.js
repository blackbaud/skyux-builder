/*jshint node: true*/
'use strict';

const logger = require('@blackbaud/skyux-logger');
const get = require('lodash.get');

const codegen = require('../utils/codegen-utils');

const assetsGenerator = require('./sky-pages-assets-generator');
const componentGenerator = require('./sky-pages-component-generator');
const routeGenerator = require('./sky-pages-route-generator');

/**
 * Generates the source necessary to register all routes + components.
 * Declared in order to satisfy jshint.
 * @name getSource
 * @returns {string} source
 */
function getSource(skyAppConfig) {
  const cssFilePaths = get(skyAppConfig, 'skyux.app.styles', []);
  const numFiles = cssFilePaths.length;

  let styles = '';
  if (numFiles > 0) {

    let hasExternal = false;
    for (let i = 0; i < numFiles; i++) {

      const filePath = cssFilePaths[i];
      if (/^http/.test(filePath)) {
        hasExternal = true;
      } else {
        styles += `require('style-loader!${filePath}');\n`;
      }
    }

    if (hasExternal) {
      logger.warn([
        '[skyuxconfig.json] External style sheets are not permitted in the `app.styles` array.',
        'Consider using `app.externals`:\n',
        'https://developer.blackbaud.com/skyux/learn/reference/configuration'
      ].join(' '));
    }
  }

  // Generate these first so we can check for 404 route
  const components = componentGenerator.getComponents(skyAppConfig);
  const componentNames = components.names;

  // Should we add the 404 route
  if (componentNames.indexOf('NotFoundComponent') === -1) {
    skyAppConfig.runtime.handle404 = true;
  }

  // Any custom runtime components/directives to concat with user defined
  // These should also be defined in runtimeImports
  const runtimeComponents = [];

  const routes = routeGenerator.getRoutes(skyAppConfig);
  const names = componentNames.concat(routes.names, runtimeComponents);

  skyAppConfig.runtime.routes = routes.routesForConfig;
  const skyAppConfigAsString = JSON.stringify(skyAppConfig);

  let runtimeImports = [
    'SkyAppBootstrapper'
  ];

  let runtimeProviders = [
    `{
      provide: SkyAppConfig,
      deps: [
        SkyAppWindowRef
      ],
      useFactory: SkyAppConfigFactory
    }`,
    `{
      provide: SkyAppAssetsService,
      useClass: ${assetsGenerator.getClassName()}
    }`,
    `{
      provide: SkyAppLocaleProvider,
      useClass: SkyAppHostLocaleProvider
    }`
  ];

  let nodeModuleImports = [
    `import { Component, NgModule, OnDestroy, OnInit } from '@angular/core';`,
    `import { CommonModule } from '@angular/common';`,
    `import { HttpModule } from '@angular/http';`,
    `import { FormsModule, ReactiveFormsModule } from '@angular/forms';`,
    `import { ActivatedRoute, RouterModule, Routes } from '@angular/router';`,
    `import { SkyAppAssetsService } from '@skyux/assets';`,
    `import { SkyAppLocaleProvider } from '@skyux/i18n';`,
    `import { SkyAppRuntimeConfigParams, SkyAppConfig } from '@skyux/config';`,
    `import { SkyAppWindowRef } from '@skyux/core';`,
    `import { SkyAuthTokenProvider } from '@skyux/http';`,
    `import { SkyThemeModule } from '@skyux/theme';`,
    `import { SkyI18nModule } from '@skyux/i18n';`,
    `import { Subscription } from 'rxjs/Subscription';`
  ];

  let runtimeModuleExports = [
    ...names
  ];

  let runtimeModuleImports = [
    'CommonModule',
    'HttpModule',
    'FormsModule',
    'ReactiveFormsModule',
    'AppExtrasModule',
    'SkyI18nModule',
    'SkyThemeModule'
  ];

  let authTokenProvider = 'SkyAuthTokenProvider';

  if (skyAppConfig.runtime.command === 'pact') {
    nodeModuleImports.push(
      `import { SkyPactAuthTokenProvider, SkyPactService } from '@skyux-sdk/pact';`
    );
    runtimeProviders
      .push(`{
        provide: SkyPactService,
        useClass: SkyPactService,
        deps: [SkyAppConfig]
      }`);
    runtimeImports.push('SkyPactAuthTokenProvider');
    runtimeImports.push('SkyPactService');
    authTokenProvider = `{
      provide: SkyAuthTokenProvider,
      useClass: SkyPactAuthTokenProvider
    }`;
  }

  runtimeProviders.push(authTokenProvider);

  if (skyAppConfig.skyux.auth) {
    nodeModuleImports.push(`import { XHRBackend, RequestOptions } from '@angular/http';`);
    nodeModuleImports.push(`import { SkyAuthHttp } from '@skyux/http';`);
    runtimeProviders.push(`{
      provide: SkyAuthHttp,
      useClass: SkyAuthHttp,
      deps: [XHRBackend, RequestOptions, SkyAuthTokenProvider, SkyAppConfig]
    }`);
  }

  if (skyAppConfig.skyux.help) {
    nodeModuleImports.push(`import { BBHelpModule } from '@blackbaud/skyux-lib-help';`);
    runtimeModuleImports.push('BBHelpModule');
    runtimeModuleExports.push('BBHelpModule');
  }

  if (skyAppConfig.runtime.includeRouteModule) {
    runtimeModuleImports.push('routing');
    runtimeProviders.push('appRoutingProviders');
  } else {
    /*
      Import the regular RouterModule so that tested components can reference things
      like routerLink
    */
    runtimeModuleImports.push('RouterModule');
  }

  let enableProdMode = ``;
  let useMockAuth = ``;

  switch (skyAppConfig.runtime.command) {
    case 'build':
      enableProdMode =
        `import { enableProdMode } from '@angular/core';
enableProdMode();`;
      break;

    case 'e2e':
      useMockAuth =
        `import { BBAuth } from '@blackbaud/auth-client';
BBAuth.mock = true;
`;
      break;
  }

  let useHashRouting = skyAppConfig.skyux.useHashRouting === true;

  let moduleSource =
    `${useMockAuth}

${nodeModuleImports.join('\n')}

import '${skyAppConfig.runtime.skyPagesOutAlias}/src/main';

import {
  AppExtrasModule
} from '${skyAppConfig.runtime.skyPagesOutAlias}/src/app/app-extras.module';

import {
  ${runtimeImports.join(', ')}
} from '${skyAppConfig.runtime.runtimeAlias}';

import {
  SkyAppHostLocaleProvider
} from '${skyAppConfig.runtime.runtimeAlias}/i18n/host-locale-provider';

${assetsGenerator.getSource()}

${routes.imports.join('\n')}

export function SkyAppConfigFactory(windowRef: SkyAppWindowRef): any {
  const config: any = ${skyAppConfigAsString};
  config.runtime.params = new SkyAppRuntimeConfigParams(
    windowRef.nativeWindow.location.toString(),
    ${JSON.stringify(skyAppConfig.skyux.params)}
  );
  return config;
}

// Setting skyux config as static property exclusively for Bootstrapper
SkyAppBootstrapper.config = ${JSON.stringify(skyAppConfig.skyux)};

${components.imports}
${routes.definitions}

// Routes need to be defined after their corresponding components
const appRoutingProviders: any[] = [${routes.providers}];
const routes: Routes = ${routes.declarations};
const routing = RouterModule.forRoot(routes, { useHash: ${useHashRouting} });

${enableProdMode}

${styles}

@NgModule({
  declarations: [
    ${names.join(',\n' + codegen.indent(2))}
  ],
  imports: [
    ${runtimeModuleImports.join(',\n' + codegen.indent(2))}
  ],
  exports: [
    ${runtimeModuleExports.join(',\n' + codegen.indent(2))}
  ],
  providers: [
    ${runtimeProviders.join(',\n' + codegen.indent(2))}
  ]
}) export class SkyPagesModule { }`;

  return moduleSource;
}

module.exports = {
  getSource: getSource
};
