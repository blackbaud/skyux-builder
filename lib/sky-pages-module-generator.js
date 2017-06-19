/*jshint node: true*/
'use strict';

const componentGenerator = require('./sky-pages-component-generator');
const routeGenerator = require('./sky-pages-route-generator');
/**
 * Generates the source necessary to register all routes + components.
 * Declared in order to satisfy jshint.
 * @name getSource
 * @returns {string} source
 */
function getSource(skyAppConfig) {

  // Generate these first so we can check for 404 route
  const components = componentGenerator.getComponents(skyAppConfig);
  const componentNames = components.names;

  // Should we add the 404 route
  if (componentNames.indexOf('NotFoundComponent') === -1) {
    skyAppConfig.runtime.handle404 = true;
  }

  // Any custom runtime components/directives to concat with user defined
  // These should also be defined in runtimeImports
  const runtimeComponents = [
    'SkyAppLinkDirective', 'LanguagePipe'
  ];

  const routes = routeGenerator.getRoutes(skyAppConfig);
  const names = `${componentNames.concat(routes.names, runtimeComponents).join(',\n    ')}`;

  skyAppConfig.runtime.routes = routes.routesForConfig;
  const skyAppConfigAsString = JSON.stringify(skyAppConfig);

  let runtimeImports = [
    'SkyAppBootstrapper',
    'SkyAppConfig',
    'SkyAppRuntimeConfigParams',
    'SkyAppWindowRef',
    'SkyAuthTokenProvider',
    'SkyAppLinkDirective',
    'SkyAppStyleLoader'
  ];

  let runtimeProviders = [
    'SkyAppWindowRef',
    'SkyAppStyleLoader',
    'SkyAuthTokenProvider',
    `{
      provide: SkyAppConfig,
      deps: [
        SkyAppWindowRef
      ],
      useFactory: SkyAppConfigFactory
    }`
  ];

  if (skyAppConfig.skyux.auth) {
    runtimeImports.push(`SkyAuthHttp`);
    runtimeProviders.push(`{
      provide: SkyAuthHttp,
      useClass: SkyAuthHttp,
      deps: [XHRBackend, RequestOptions, SkyAuthTokenProvider, SkyAppConfig]
    }`);
  }

  let runtimeModuleImports = [
    'CommonModule',
    'HttpModule',
    'FormsModule',
    'ReactiveFormsModule',
    'SkyModule',
    'AppExtrasModule'
  ];

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

  let moduleSource =
`${useMockAuth}
import '${skyAppConfig.runtime.skyPagesOutAlias}/src/main';

import {
  Component,
  Inject,
  NgModule,
  OnInit,
  OnDestroy,
  OpaqueToken
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpModule, XHRBackend, RequestOptions } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Routes } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { SkyModule } from '${skyAppConfig.runtime.skyuxPathAlias}/core';
import { LanguagePipe } from '../runtime/pipes/language.pipe';
import {
  AppExtrasModule
} from '${skyAppConfig.runtime.skyPagesOutAlias}/src/app/app-extras.module';
import { ${runtimeImports.join(', ')} } from '${skyAppConfig.runtime.runtimeAlias}';
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
const routing = RouterModule.forRoot(routes);

${enableProdMode}

@NgModule({
  declarations: [
    ${names}
  ],
  imports: [
   ${runtimeModuleImports.join()}
  ],
  exports: [
    ${names}
  ],
  providers: [
    ${runtimeProviders.join()}
  ]
}) export class SkyPagesModule { }`;

  return moduleSource;
}

module.exports = {
  getSource: getSource
};
