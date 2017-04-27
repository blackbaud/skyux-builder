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

  const routes = routeGenerator.getRoutes(skyAppConfig);
  const names = `${componentNames.concat(routes.names).join(',\n    ')}`;
  const skyAppConfigAsString = JSON.stringify(skyAppConfig);

  skyAppConfig.runtime.routes = routes.routesForConfig;

  let runtimeImports = [
    'SkyAppBootstrapper',
    'SkyAppConfig',
    'SkyAppWindowRef',
    'SkyAuthTokenProvider'
  ];

  let runtimeProviders = [
    'SkyAppWindowRef',
    'SkyAuthTokenProvider',
    `{
      provide: SkyAppConfig,
      useValue: ${skyAppConfigAsString}
    }`
  ];

  if (skyAppConfig.skyux.auth) {
    runtimeImports.push(`SkyAuthHttp`);
    runtimeProviders.push(`{
      provide: SkyAuthHttp,
      useClass: SkyAuthHttp,
      deps: [XHRBackend, RequestOptions, SkyAppWindowRef, SkyAuthTokenProvider]
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
import {
  AppExtrasModule
} from '${skyAppConfig.runtime.skyPagesOutAlias}/src/app/app-extras.module';
import { ${runtimeImports.join(', ')} } from '${skyAppConfig.runtime.runtimeAlias}';

// Setting skyux config as static property exclusively for Bootstrapper
SkyAppBootstrapper.config = ${JSON.stringify(skyAppConfig.skyux)};

${components.imports}
${routes.definitions}

// Routes need to be defined after their corresponding components
const appRoutingProviders: any[] = [];
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
