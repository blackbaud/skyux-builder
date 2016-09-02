'use strict';

const glob = require('glob');
const util = require('util');

/**
 * Given a path part, extract the param.
 * @name getParam
 * @param {string} part
 * @returns {string} param
 */
const getParam = (part) => {
  const param = /{(.*)}/.exec(part);
  return param ? param[1] : part;
}

/**
 * Given a entry, extract the params, and SKYUX2 path.
 * @name getPathParams
 * @param {SkyPagesEntry} entry
 * @returns {Object} cleanedName
 */
const getPathParams = (entry) => {
  let path = [];
  let params = [];

  // Have to handle empty part (default route)
  entry.pathParts.forEach((part) => {
    if (part) {
      const param = getParam(part);
      if (part !== param) {
        params.push(param);
        path.push(':' + param);
      } else {
        path.push(part);
      }
    }
  });

  return {
    path: path.join('/'),
    params: params
  };
}

/**
 * Given an entry, reads it and extracts any component names.
 * @name getSiblingComponentName
 * @param {SkyPagesEntry} entry
 * @returns {string} componentName
 */
const getSiblingComponentName = (entry) => {
  const groups = /(class )([^\s]+)/gi.exec(entry.get());
  if (groups.length > 2) {
    return groups[2];
  }
}

/**
 * Given an entry, return a component name.
 * @name getGeneratedComponentName
 * @param {SkyPagesEntry} entry
 * @returns {string} componentName
 */
const getGeneratedComponentName = (entry) => {
  let name = '';
  entry.pathParts.forEach((part) => {
    part = getParam(part);
    if (part.length > 1) {
      name += part[0].toUpperCase() + part.substr(1).toLowerCase();
    } else {
      name += part;
    }
  });
  return name + 'IndexComponent';
}

/**
 * Given an entry, return a component definition.
 * @name getComponentDefinition
 * @param {SkyPagesEntry} entry
 * @param {Array} [params]
 * @returns {string} componentDefinition
 */
const getComponentDefinition = (name, path, params) => {
  let paramsExpose = '';
  let paramsSet = '';

  params.forEach((param) => {
    paramsExpose += `public ${param}: any;\n`;
    paramsSet += `this.${param} = params['${param}'];\n`
  });

  return `
    @Component({ template: require('${path}') })
    class ${name} implements OnInit, OnDestroy {
     private sub: Subscription;
     ${paramsExpose}

     constructor(
       @Inject(SkyPagesProvider) public SKY_PAGES: any,
       private route: ActivatedRoute
     ) { }
     ngOnInit() {
       this.sub = this.route.params.subscribe(params => {
         ${paramsSet}
       });
     }

     ngOnDestroy() {
       this.sub.unsubscribe();
     }
    }
  `;
}

/**
 * Joins an array with the given separator.
 * @name join
 * @param {Array} items - Array of items to join
 * @param {string} [sep=\n] - Separator
 * @returns {string} componentName
 */
const join = (items, sep) => {
  sep = sep || '\n';
  return items.join(sep);
}

/**
 * Generates the source necessary to register all routes + components.
 * @name getSource
 * @param {string} source
 * @returns {string} source
 */
const getSource = (SKY_PAGES, source) => {
  let componentNames = [];
  let components = [];
  let siblingPaths = [];
  let routes = [];
  let isNotFoundDefined = false;

  SKY_PAGES.entries.forEach((entry) => {

    const pathParams = getPathParams(entry);
    const componentName = getGeneratedComponentName(entry);

    entry.siblings.forEach((sibling) => {
        const siblingName = getSiblingComponentName(sibling);
        componentNames.push(siblingName);
        siblingPaths.push(`import { ${siblingName} } from '${sibling.pathWeb}'`);
    });

    routes.push(`{ path: '${pathParams.path}', component: ${componentName}}`);
    componentNames.push(componentName);
    components.push(getComponentDefinition(
      componentName,
      entry.pathWeb,
      pathParams.params
    ));
  });

  // Add 404 handler if it doesn't exist
  routes.push(`{ path: '**', component: NotFoundComponent }`);
  if (componentNames.indexOf('NotFoundComponent') === -1) {
    componentNames.push('NotFoundComponent');
    components.push(`
      @Component({ template: '404' })
      class NotFoundComponent {}
    `);
  }

  return `
    import {
      Component,
      enableProdMode,
      Inject,
      NgModule,
      NgZone,
      OnInit,
      OnDestroy,
      OpaqueToken
    } from '@angular/core';
    import { CommonModule } from '@angular/common';
    import { HttpModule } from '@angular/http';
    import { ActivatedRoute, RouterModule, Routes } from '@angular/router';
    import { Subscription } from 'rxjs/Subscription';
    import { SkyModule } from 'blackbaud-skyux2/dist/core';

    // Needed before component declarations since the provider is injected.
    const SkyPagesProvider = new OpaqueToken('SKY_PAGES');

    ${join(siblingPaths)}
    ${join(components)}

    // Routes need to be defined after their corresponding components
    const appRoutingProviders: any[] = [];
    const routes: Routes = [ ${join(routes, ',')} ];
    const routing = RouterModule.forRoot(routes);

    if (SKY_PAGES.command === 'build') {
      enableProdMode();
    }

    @NgModule({
      declarations: [ ${join(componentNames, ',')} ],
      imports: [ CommonModule, HttpModule, SkyModule, routing ],
      exports: [ ${join(componentNames, ',')} ],
      providers: [
        appRoutingProviders,
        { provide: SkyPagesProvider, useValue: SKY_PAGES }
      ]
    })
    export class SkyPagesModule {}
  `;
}

// fat-arrow method definition does not work here.
// webpack doesn't apply correct context to this if we did.
module.exports = function (source, map) {
  return getSource(this.options.SKY_PAGES, source);
};
