/*jshint node: true*/
'use strict';

function indent(count) {
  let indentation = '';

  for (let i = 0; i < count; i++) {
    indentation += '  ';
  }

  return indentation;
}

/**
 * Given a path part, extract the param.
 * @name getParam
 * @param {string} part
 * @returns {string} param
 */
function getParam(part) {
  const param = /{(.*)}/.exec(part);
  return param ? param[1] : part;
}

/**
 * Given a entry, extract the params, and SKYUX2 path.
 * @name getPathParams
 * @param {SkyPagesEntry} entry
 * @returns {Object} cleanedName
 */
function getPathParams(entry) {
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
function getSiblingComponentName(entry) {
  const groups = /(class )([^\s]+)/gi.exec(entry.get());
  if (groups && groups.length > 2) {
    return groups[2];
  }
}

/**
 * Given an entry, return a component name.
 * Removes any non-word items.
 * @name getGeneratedComponentName
 * @param {SkyPagesEntry} entry
 * @returns {string} componentName
 */
function getGeneratedComponentName(entry) {
  let name = '';
  entry.pathParts.forEach((part) => {
    part = getParam(part).replace(/\W+/g, '');
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
function getComponentDefinition(name, path, params, spaPathAlias, useTemplateUrl) {
  let paramsExpose = '';
  let paramsSet = '';

  params.forEach((param) => {
    paramsExpose += `${indent(1)}public ${param}: any;\n`;
    paramsSet += `this.${param} = params['${param}'];\n`;
  });

  let templateProp = useTemplateUrl ?
     `templateUrl: '${spaPathAlias}/${path}'` :
     `template: require('${path}')`;

  return `@Component({
  ${templateProp}
})
export class ${name} implements OnInit, OnDestroy {
  private sub: Subscription;
${paramsExpose}
  constructor(
    @Inject(SkyPagesProvider) public SKY_PAGES: any,
    private route: ActivatedRoute
  ) { }

  public ngOnInit() {
    this.sub = this.route.params.subscribe(params => { ${paramsSet} });
  }

  public ngOnDestroy() {
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
function join(items, sep) {
  sep = sep || '\n';
  return items.join(sep);
}

/**
 * Converts the file path to an aliased path that can be pulled in by Webpack
 * @name importPath
 * @param {Array} path The path to convert.
 * @returns {string} The converted path.
 */
function importPath(path, spaPathAlias) {
  // Prepend the alias and remove the file extension since the file extension causes
  // a TypeScript error.
  return spaPathAlias + '/' + path.replace(/\.[^\.]+$/, '');
}

/**
 * Generates the source necessary to register all routes + components.
 * Declared in order to satisfy jshint.
 * @name getSource
 * @returns {string} source
 */
function getSource(
  skyPagesConfig,
  skyPagesOutAlias,
  spaPathAlias,
  skyuxPathAlias,
  useTemplateUrl
) {
  let componentNames = [];
  let components = [];
  let siblingPaths = [];
  let routes = [];

  skyPagesOutAlias = skyPagesOutAlias || 'sky-pages-internal';
  spaPathAlias = spaPathAlias || 'sky-pages-spa';
  skyuxPathAlias = skyuxPathAlias || 'blackbaud-skyux2/dist';

  skyPagesConfig.entries.forEach((entry) => {
    const pathParams = getPathParams(entry);
    const componentName = getGeneratedComponentName(entry);

    entry.siblings.forEach((sibling) => {
      const siblingName = getSiblingComponentName(sibling);
      componentNames.push(siblingName);
      siblingPaths.push(
        `import {
  ${siblingName}
} from '${importPath(sibling.pathWeb, spaPathAlias)}';
`
      );
    });

    routes.push(`{
    path: '${pathParams.path}',
    component: ${componentName}
  }`);
    componentNames.push(componentName);
    components.push(getComponentDefinition(
      componentName,
      entry.pathWeb,
      pathParams.params,
      spaPathAlias,
      useTemplateUrl
    ));
  });

  // Add 404 handler if it doesn't exist
  routes.push(`{
    path: '**',
    component: NotFoundComponent
  }`);
  if (componentNames.indexOf('NotFoundComponent') === -1) {
    componentNames.push('NotFoundComponent');
    components.push(`
@Component({
  template: '404'
})
export class NotFoundComponent { }
    `);
  }

  let moduleSource =
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
import { SkyModule } from '${skyuxPathAlias}/core';
import { AppExtrasModule } from '${skyPagesOutAlias}/app-extras.module';

export const SKY_PAGES: any = ${JSON.stringify(skyPagesConfig)};

// Needed before component declarations since the provider is injected.
export const SkyPagesProvider = new OpaqueToken('SKY_PAGES');

${join(siblingPaths)}
${join(components)}

// Routes need to be defined after their corresponding components
const appRoutingProviders: any[] = [];

const routes: Routes = [
  ${join(routes, ',\n' + indent(1))}
];

const routing = RouterModule.forRoot(routes);

if (SKY_PAGES.command === 'build') {
  enableProdMode();
}

@NgModule({
  declarations: [
    ${join(componentNames, ',\n' + indent(2))}
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
    ${join(componentNames, ',\n' + indent(2))}
  ],
  providers: [
    appRoutingProviders,
    { provide: SkyPagesProvider, useValue: SKY_PAGES }
  ]
})
export class SkyPagesModule { }
`;

  return moduleSource;
}

module.exports = {
  getSource: getSource
};
