/*jshint node: true*/
'use strict';

const glob = require('glob');
const path = require('path');

function indent(count) {
  return '  '.repeat(count);
}

function generateDefinition(skyPagesConfig, file, name, params) {

  // Necessary to support AOT
  let templateProp = `template: require('${file}')`;
  if (skyPagesConfig.useTemplateUrl) {
    templateProp = `templateUrl: '${skyPagesConfig.spaPathAlias}/${file}'`;
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
    @Inject(SkyPagesProvider) public SKY_PAGES: any,
    private route: ActivatedRoute
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

function parseFileIntoEntity(skyPagesConfig, file, index) {

  let routePath = [];
  let routeParams = [];

  // Removes srcPath + filename
  // glob always uses '/' for path separator!
  file
    .split('/')
    .slice(skyPagesConfig.srcPath.split('/').length - 1, -1)
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
    skyPagesConfig,
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

function generateRoutes(skyPagesConfig) {
  let counter = 0;
  let entities = glob
    .sync(path.join(skyPagesConfig.srcPath, skyPagesConfig.routesPattern))
    .map(file => parseFileIntoEntity(skyPagesConfig, file, counter++));

  if (skyPagesConfig.handle404) {
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

function getRoutes(skyPagesConfig) {
  const routes = skyPagesConfig.routes || generateRoutes(skyPagesConfig);
  return {
    declarations: generateDeclarations(routes),
    definitions: generateDefinitions(routes),
    names: generateNames(routes)
  };
}

module.exports = {
  getRoutes: getRoutes
};
