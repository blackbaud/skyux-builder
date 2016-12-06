/*jshint node: true*/
'use strict';

var helpers = require('./helpers');

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
 * Given a route, extract the path and params.
 * @name getRoutePathParams
 * @param {SkyPagesFile} route
 * @returns {Object} path, params
 */
function getRoutePathParams(route) {
  let path = [];
  let params = [];

  // Have to handle empty part (default route)
  route.pathParts.forEach((part) => {
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
 * Given an entry, return a component definition.
 * @name getComponentDefinition
 * @param {SkyPagesEntry} entry
 * @param {Array} [params]
 * @returns {string} componentDefinition
 */
function getComponentDefinition(skyPagesConfig, component) {
  const name = getComponentName(component);
  let paramsExpose = '';
  let paramsSet = '';
  let pathParams = getRoutePathParams(component);

  pathParams.params.forEach((param) => {
    paramsExpose += helpers.indent(2) + `public ${param}: any;\n`;
    paramsSet += `this.${param} = params['${param}'];\n`;
  });

  let templateProp = skyPagesConfig.useTemplateUrl ?
     `templateUrl: '${skyPagesConfig.spaPathAlias}/${component.pathWeb}'` :
     `template: require('${component.path}')`;

  let definition =
`// BEGIN AUTO GENERATED ROUTE COMPONENT: ${name}
@Component({
  ${templateProp}
})
export class ${getComponentName(component)} implements OnInit, OnDestroy {
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
// END AUTO GENERATED ROUTE COMPONENT: ${name}
`;

  return definition;
}

/**
 * Given the skyPagesConfig, returns the components.
 * @name getComponents
 * @param {Object} skyPagesConfig
 * @returns {String} components
 */
function getComponents(skyPagesConfig) {
  return skyPagesConfig.routes
    .map(component => getComponentDefinition(skyPagesConfig, component))
    .join('\n\n');
}

/**
 * Given the skyPagesConfig, returns an array of component names.
 * @name getComponentNames,
 * @returns [Array] componentNames
 */
function getComponentNames(skyPagesConfig) {
  return skyPagesConfig.routes.map(getComponentName);
}

/**
 * Given an entry, return a component name.
 * Removes any non-word items.
 * @name getComponentName
 * @param {SkyPagesFile} route
 * @returns {string} componentName
 */
function getComponentName(route) {
  let name = '';
  route.pathParts.forEach((part) => {
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
 * Given the skyPagesConfig, returns an object mapping for ComponentName: SkyPagesRoute
 * @name getRoutes
 * @param {Object} skyPagesConfig
 * @returns {Array} routes
 */
function getRoutes(skyPagesConfig) {
  const routes = skyPagesConfig.routes.map(route => {
    const name = getComponentName(route);
    const path = getRoutePathParams(route).path;

    return helpers.indent(1) + `{ path: '${path}', component: ${name} }`;
  });
  return `[
${routes.join(',\n')}
]`;
}

module.exports = {
  getComponents: getComponents,
  getComponentNames: getComponentNames,
  getRoutes: getRoutes
};
