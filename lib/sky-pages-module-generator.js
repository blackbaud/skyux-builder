/*jshint node: true*/
'use strict';

const merge = require('merge');
const componentGenerator = require('./sky-pages-component-generator');
const routeGenerator = require('./sky-pages-route-generator');
const bootstrapGenerator = require('./sky-pages-bootstrap-generator');
/**
 * Generates the source necessary to register all routes + components.
 * Declared in order to satisfy jshint.
 * @name getSource
 * @returns {string} source
 */
function getSource(skyPagesConfig) {

  // We put our defaults here instead of skyuxconfig.json for testing purposes
  skyPagesConfig = merge.recursive({
    srcPath: 'src/app/',
    routesPattern: '**/index.html',
    componentsPattern: '**/*.component.ts',
    spaPathAlias: 'sky-pages-spa',
    skyPagesOutAlias: 'sky-pages-internal',
    skyuxPathAlias: '@blackbaud/skyux/dist',
    runtimeAlias: 'sky-pages-internal/runtime',
    useTemplateUrl: false
  }, skyPagesConfig);

  // Generate these first so we can check for 404 route
  const components = componentGenerator.getComponents(skyPagesConfig);
  const componentNames = components.names;

  // Should we add the 404 route
  if (componentNames.indexOf('NotFoundComponent') === -1) {
    skyPagesConfig.handle404 = true;
  }

  const bootstrap = bootstrapGenerator.getBootstrap(skyPagesConfig);
  const routes = routeGenerator.getRoutes(skyPagesConfig);
  const names = `${componentNames.concat(routes.names).join(',\n    ')}`;

  let authHttpImport = '';
  let authHttpProvider = '';

  if (skyPagesConfig.auth) {
    authHttpImport = `import { SkyAuthHttp } from '${skyPagesConfig.runtimeAlias}';`;
    authHttpProvider = `
    ,{
      provide: SkyAuthHttp,
      useClass: SkyAuthHttp,
      deps: [XHRBackend, RequestOptions]
    }`;
  }

  let moduleSource =
`export const SKY_PAGES: any = ${JSON.stringify(skyPagesConfig)};

${bootstrap}import '${skyPagesConfig.skyPagesOutAlias}/src/main';

import {
  Component,
  enableProdMode,
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
import { SkyModule } from '${skyPagesConfig.skyuxPathAlias}/core';
import { AppExtrasModule } from '${skyPagesConfig.skyPagesOutAlias}/src/app/app-extras.module';
${authHttpImport}

// Needed before component declarations since the provider is injected.
export const SkyPagesProvider = new OpaqueToken('SKY_PAGES');

${components.imports}
${routes.definitions}

// Routes need to be defined after their corresponding components
const appRoutingProviders: any[] = [];
const routes: Routes = ${routes.declarations};
const routing = RouterModule.forRoot(routes);

if (SKY_PAGES.command === 'build') {
  enableProdMode();
}

@NgModule({
  declarations: [
    ${names}
  ],
  imports: [
    CommonModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    SkyModule,
    AppExtrasModule,
    routing
  ],
  exports: [
    ${names}
  ],
  providers: [
    appRoutingProviders,
    {
      provide: SkyPagesProvider,
      useValue: SKY_PAGES
    }
    ${authHttpProvider}
  ]
}) export class SkyPagesModule { }`;

  return moduleSource;
}

module.exports = {
  getSource: getSource
};
