/*jshint node: true*/
'use strict';

const glob = require('glob');
const path = require('path');

function indent(count) {
  return '  '.repeat(count);
}

function generateDefinition(skyAppConfig, file, name, params) {

  // Necessary to support AOT
  let templateProp = `template: require('${file}')`;
  if (skyAppConfig.runtime.useTemplateUrl) {
    templateProp = `templateUrl: '${skyAppConfig.runtime.spaPathAlias}/${file}'`;
  }

  let paramDeclarations = '';
  let paramsConstructors = '';
  params.forEach(param => {
    paramDeclarations += indent(1) + `public ${param}: any;\n`;
    paramsConstructors += indent(3) + `this.${param} = params['${param}'];\n`;
  });

  const definition =
`// AUTO GENERATED FROM: ${file}
@Component({
  ${templateProp}
})
export class ${name} implements OnInit, OnDestroy {
  private sub: Subscription;
${paramDeclarations}
  constructor(
    private route: ActivatedRoute,
    private config: SkyAppConfig
  ) { }

  public ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
${paramsConstructors}
    });
  }

  public ngOnDestroy() {
    this.sub.unsubscribe();
  }
}`;
  return definition;
}

function parseFileIntoEntity(skyAppConfig, file, index) {

  let routePath = [];
  let routeParams = [];

  // Removes srcPath + filename
  // glob always uses '/' for path separator!
  file
    .split('/')
    .slice(skyAppConfig.runtime.srcPath.split('/').length - 1, -1)
    .forEach(pathPart => {

    const possibleParam = /^_(.*)$/.exec(pathPart);
    const param = possibleParam ? possibleParam[1] : pathPart;

    // This means we found a route param, ex: "{id}"
    if (param !== pathPart) {
      routePath.push(':' + param);
      routeParams.push(param);
    } else {
      routePath.push(param);
    }
  });

  const componentName = `SPR_${index}_IndexComponent`;
  const componentDefinition = generateDefinition(
    skyAppConfig,
    file,
    componentName,
    routeParams
  );

  return {
    componentName: componentName,
    componentDefinition: componentDefinition,
    routePath: routePath.join('/'),
    routeParams: routeParams
  };
}

function generateRoutes(skyAppConfig) {
  let counter = 0;
  let entities = glob
    .sync(path.join(skyAppConfig.runtime.srcPath, skyAppConfig.runtime.routesPattern))
    .map(file => parseFileIntoEntity(skyAppConfig, file, counter++));

  if (skyAppConfig.runtime.handle404) {
    entities.push({
      componentName: 'NotFoundComponent',
      componentDefinition: `@Component({ template: '404' }) export class NotFoundComponent { }`,
      routePath: ['**'],
      routeParams: []
    });
  }

  return entities;
}

function generateDefinitions(routes) {
  return routes.map(route => route.componentDefinition).join('\n\n');
}

function generateDeclarations(routes) {
  const p = indent(1);
  const declarations = routes
    .map(r => `${p}{ path: '${r.routePath}', component: ${r.componentName} }`)
    .join(',\n');
  return `[\n${declarations}\n]`;
}

function generateNames(routes) {
  return routes.map(route => route.componentName);
}

function getRoutes(skyAppConfig) {
  const routes = generateRoutes(skyAppConfig);
  return {
    declarations: generateDeclarations(routes),
    definitions: generateDefinitions(routes),
    names: generateNames(routes),
    routes: routes
  };
}

module.exports = {
  getRoutes: getRoutes
};
