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
  let guard;
  if (fs.existsSync(guardPath)) {
    guard = extractGuard(guardPath);
  }

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
    guard: guard
  };
}

function generateRoutes(skyAppConfig) {
  let counter = 0;
  let entities = glob
    .sync(path.join(skyAppConfig.runtime.srcPath, skyAppConfig.runtime.routesPattern))
    .map(file => parseFileIntoEntity(skyAppConfig, file, counter++));

  if (skyAppConfig.runtime.handle404) {
    const err = `<sky-error errorType="notfound"></sky-error>`;
    entities.push({
      componentName: 'NotFoundComponent',
      componentDefinition: `@Component({ template: '${err}' }) export class NotFoundComponent { }`,
      routePath: ['**'],
      routeParams: []
    });
  }

  return entities;
}

function generateDefinitions(routes) {
  return routes.map(route => route.componentDefinition).join('\n\n');
}

function generateRouteDeclaration(route) {
  let guard = route.guard ? route.guard.name : '';
  let childRoutes = '';
  route.children.forEach(child => childRoutes += generateRouteDeclaration(child));

  return `{
    path: '${route.routePath}',
    component: ${route.componentName},
    canActivate: [${guard}],
    canDeactivate: [${guard}],
    canActivateChild: [${guard}],
    children: [${childRoutes}]
  }`;
}

function mapRoutes(routes, mappedRoutes = [], routeMap = {}) {
  const unmappedRoutes = [];

  routes.forEach(route => {
    if (route.routePath.indexOf('/') === -1) {
      mappedRoutes.push(route);
      routeMap[route.routePath] = route;
      route.children = [];
    } else {
      const routeParentPath = route.routePath.substring(0, route.routePath.lastIndexOf('/'));
      const routeParent = routeMap[routeParentPath];
      if (routeParent) {
        routeParent.children.push(route);
        routeMap[route.routePath] = route;
        route.routePath = route.routePath.substring(routeParentPath.length + 1);
        route.children = [];
      } else {
        unmappedRoutes.push(route);
      }
    }
  });

  // if we have managed to map at least one route
  // but still have unmapped routes, recurse!
  if (mappedRoutes.length > 1 && unmappedRoutes.length > 0) {
    return mapRoutes(routes, mappedRoutes, routeMap);
  }

  return mappedRoutes;
}

function generateDeclarations(routes) {
  const p = indent(1);

  const mappedRoutes = mapRoutes(routes);
  const declarations = mappedRoutes
    .map(r => generateRouteDeclaration(r))
    .join(',\n');

  return `[\n${declarations}\n]`;
}

function generateRuntimeImports(skyAppConfig, routes) {
  const alias = skyAppConfig.runtime.spaPathAlias;
  return routes
    .filter(r => r.guard)
    .map(r =>`import { ${r.guard.name} } from '${alias}/${r.guard.path.replace(/\.ts$/, '')}';`);
}

function generateProviders(routes) {
  return routes
    .filter(r => r.guard)
    .map(r => r.guard.name);
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
    imports: generateRuntimeImports(skyAppConfig, routes),
    providers: generateProviders(routes),
    names: generateNames(routes),
    routesForConfig: getRoutesForConfig(routes)
  };
}

function extractGuard(file) {
  const matchRegexp = /@Injectable\s*\(\s*\)\s*export\s*class\s(\w+)/g;
  const content = fs.readFileSync(file, { encoding: 'utf8' });

  let result;
  let match;
  while ((match = matchRegexp.exec(content))) {
    if (result !== undefined) {
      throw new Error(`As a best practice, only export one guard per file in ${file}`);
    }

    result = { path: file.replace(/\\/g, '/'), name: match[1] };
  }

  return result;
}

module.exports = {
  getRoutes: getRoutes
};
