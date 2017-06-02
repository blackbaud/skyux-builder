/*jshint node: true*/
'use strict';

const glob = require('glob');
const path = require('path');
const fs = require('fs');

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
  let parsedPath = path.parse(file);

  // Make no assumptions on extension used to create route, just remove
  // it and append .guard.ts (ex: index.html -> index.guard.ts)
  let guardPath = path.join(parsedPath.dir, `${parsedPath.name}.guard.ts`);

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
    routeParams: routeParams,
    guardPath: fs.existsSync(guardPath) ? guardPath : undefined
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
    .map(r => {
      let guard = r.guardPath ? `require('${r.guardPath}').default` : '';
      let declaration =
`${p}{
  path: '${r.routePath}',
  component: ${r.componentName},
  canActivate: [${guard}],
  canDeactivate: [${guard}]
}`;

      return declaration;
    })
    .join(',\n');
  return `[\n${declarations}\n]`;
}

function generateProviders(routes) {
  const providers = routes
    .map(r => r.guardPath ? `require('${r.guardPath}').default` : undefined)
    .filter(p => p);

  return `[\n${providers}\n]`;
}

function generateNames(routes) {
  return routes.map(route => route.componentName);
}

// Only expose certain properties to SkyAppConfig.
// Specifically routeDefinition caused errors for skyux e2e in Windows.
function getRoutesForConfig(routes) {
  return routes.map(route => ({
    routePath: route.routePath,
    routeParams: route.routeParams
  }));
}

function getRoutes(skyAppConfig) {
  const routes = generateRoutes(skyAppConfig);
  return {
    declarations: generateDeclarations(routes),
    definitions: generateDefinitions(routes),
    providers: generateProviders(routes),
    names: generateNames(routes),
    routesForConfig: getRoutesForConfig(routes)
  };
}

module.exports = {
  getRoutes: getRoutes
};
