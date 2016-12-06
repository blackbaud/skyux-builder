/*jshint node: true*/
'use strict';

var merge = require('merge');
var helpers = require('./helpers');

/**
 * Generates the source necessary to register all routes + components.
 * Declared in order to satisfy jshint.
 * @name getSource
 * @returns {string} source
 */
function getSource(skyPagesConfig) {

  const routeGenerator = require('./sky-pages-route-generator');
  const componentGenerator = require('./sky-pages-component-generator');

  merge(skyPagesConfig, {
    spaPathAlias: 'sky-pages-spa',
    skyPagesOutAlias: 'sky-pages-internal',
    skyuxPathAlias: 'blackbaud-skyux2/dist'
  });

  const COMPONENTS = componentGenerator.getComponents(skyPagesConfig);
  const ROUTES = routeGenerator.getRoutes(skyPagesConfig);
  const ROUTE_COMPONENTS = routeGenerator.getComponents(skyPagesConfig);
  const NAMES = helpers.joinAsString(
    routeGenerator.getComponentNames(skyPagesConfig),
    componentGenerator.getComponentNames(skyPagesConfig)
  );

  const moduleSource =
`import {
  Component,
  enableProdMode,
  Inject,
  NgModule,
  OnInit,
  OnDestroy,
  OpaqueToken
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Routes } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { SkyModule } from '${skyPagesConfig.skyuxPathAlias}/core';
import { AppExtrasModule } from '${skyPagesConfig.skyPagesOutAlias}/app-extras.module';

export const SKY_PAGES: any = ${JSON.stringify(skyPagesConfig)};

// Needed before component declarations since the provider is injected.
export const SkyPagesProvider = new OpaqueToken('SKY_PAGES');

${COMPONENTS}
${ROUTE_COMPONENTS}

// Routes need to be defined after their corresponding components
const appRoutingProviders: any[] = [];
const routes: Routes = ${ROUTES};
const routing = RouterModule.forRoot(routes);

if (SKY_PAGES.command === 'build') {
  enableProdMode();
}

@NgModule({
  declarations: ${NAMES},
  imports: [
    CommonModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    SkyModule,
    AppExtrasModule,
    routing
  ],
  exports: ${NAMES},
  providers: [
    appRoutingProviders,
    { provide: SkyPagesProvider, useValue: SKY_PAGES }
  ]
}) export class SkyPagesModule { }
`;
  return moduleSource;
}

module.exports = {
  getSource: getSource
};
