/*jshint node: true*/
'use strict';

const glob = require('glob');
const path = require('path');
const fs = require('fs');

const codegen = require('../utils/codegen-utils');

function generateDefinition(skyAppConfig, file, name, params) {

  // Necessary to support AOT
  let templateProp = `template: require('${file}')`;
  if (skyAppConfig.runtime.useTemplateUrl) {
    templateProp = `templateUrl: '${skyAppConfig.runtime.spaPathAlias}/${file}'`;
  }

  let paramDeclarations = '';
  let paramsConstructors = '';
  params.forEach(param => {
    paramDeclarations += codegen.indent(1, `public ${param}: any;\n`);
    paramsConstructors += codegen.indent(3, `this.${param} = params['${param}'];\n`);
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
    public config: SkyAppConfig
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

function generateRedirects(skyAppConfig) {
  let redirects = [];
  if (skyAppConfig.skyux && skyAppConfig.skyux.redirects) {
    redirects = Object.keys(skyAppConfig.skyux.redirects).map(key => {
      return `{
  path: '${key}',
  redirectTo: '${skyAppConfig.skyux.redirects[key]}'
}`;
    });
  }

  return redirects;
}

function generateRoutes(skyAppConfig) {
  let counter = 0;
  let entities = glob
    .sync(path.join(skyAppConfig.runtime.srcPath, skyAppConfig.runtime.routesPattern))
    .map(file => parseFileIntoEntity(skyAppConfig, file, counter++));

  // Add a root component that will become the wrapper for all the others
  entities.push({
    routePath: ['?'], // we need a non-empty route path so it won't be merged later
    componentName: 'RootComponent',
    componentDefinition:
      `@Component({ template: '<router-outlet></router-outlet>' }) export class RootComponent {}`
  });

  const notFoundComponent = {
    componentName: 'NotFoundComponent',
    routePath: ['**'],
    routeParams: []
  };

  if (skyAppConfig.runtime.handle404) {
    const err = [
      '<iframe src="https://host.nxt.blackbaud.com/errors/notfound"',
      'style="border:0;height:100vh;width:100%;"',
      `[title]="'skyux_builder_page_not_found_iframe_title' | skyAppResources"></iframe>`
    ].join(' ');
    notFoundComponent.componentDefinition =
      `@Component({ template: \`${err}\` }) export class NotFoundComponent { }`;
  }

  entities.push(notFoundComponent);

  return entities;
}

function generateDefinitions(routes) {
  return routes.map(route => route.componentDefinition).join('\n\n');
}

function generateRouteDeclaration(route) {
  const childRoutes = route.children
    .map(child => generateRouteDeclaration(child))
    .join(',\n');

  return `{
    path: '${route.routePath}',
    component: ${route.componentName},
    canActivate: [${route.guard && route.guard.canActivate ? route.guard.name : ''}],
    canDeactivate: [${route.guard && route.guard.canDeactivate ? route.guard.name : ''}],
    canActivateChild: [${route.guard && route.guard.canActivateChild ? route.guard.name : ''}],
    children: [${childRoutes}]
  }`;
}

function parseRoute(route) {
  let result;
  route.routePath = (route.routePath || '').toString();

  const routeTokens = route.routePath.split('/');
  const lastToken = routeTokens[routeTokens.length - 1];
  const secondLastToken = routeTokens[routeTokens.length - 2];

  // if it begins with #, that indicates we should create a child route
  if (lastToken.startsWith('#') ||
      (secondLastToken && secondLastToken.startsWith('#') && lastToken.startsWith(':'))
  ) {
    const reversedTokens = routeTokens.slice().reverse();
    const childTokens = [lastToken];
    for (let i = 1; i < reversedTokens.length; i++) {
      let token = reversedTokens[i];
      if (token.startsWith('#')) {
        childTokens.push(token);
      } else {
        break;
      }
    }

    // calculate the top level portion of the route, excluding child routes
    result = {
      routePath: routeTokens.slice(0, routeTokens.length - childTokens.length).join('/'),
      children: []
    };

    // traverse child tokens and create the child routes
    let currentRoute = result;
    childTokens.reverse().forEach(token => {
      let childToken = {
        routePath: token.startsWith('#') ? token.substring(1) : token,
        children: []
      };

      if (token === lastToken) {
        childToken.componentName = route.componentName;
        childToken.guard = route.guard;
      }

      currentRoute.children.push(childToken);
      currentRoute = childToken;
    });
  } else {
    // top level route, just add it
    result = {
      routePath: route.routePath,
      guard: route.guard,
      componentName: route.componentName,
      children: []
    };
  }

  // strip # characters out of routes
  result.routePath = result.routePath.replace(/\#/g, '');
  return result;
}

function mergeRoutes(routes) {
  const routeIndex = {};
  const uniqueRoutes = [];

  routes.forEach(route => {
    // if route already exists, recursively merge its children as well
    // as its guard and componentName properties
    const existingRoute = routeIndex[route.routePath];
    if (existingRoute) {
      route.children.forEach(rc => existingRoute.children.push(rc));
      existingRoute.children = mergeRoutes(existingRoute.children);

      if (route.componentName) {
        existingRoute.componentName = route.componentName;
      }

      if (route.guard) {
        existingRoute.guard = route.guard;
      }
    } else {
      routeIndex[route.routePath] = route;
      uniqueRoutes.push(route);
    }
  });

  return uniqueRoutes;
}

function generateDeclarations(skyAppConfig, routes) {
  let mappedRoutes = mergeRoutes(routes.map(r => parseRoute(r)));

  // nest all routes under a top-level route to allow for app-wide guard
  // steal guard from app/index component, if exists
  const baseRoutes = mappedRoutes.filter(e => e.routePath === '?' || e.routePath === '**');
  const rootRoute = baseRoutes[0];

  // Look for index route, 'steal' its guard for the root route if available
  const indexRoute = mappedRoutes.filter(e => e.routePath === '' && e.guard)[0];
  if (indexRoute) {
    rootRoute.guard = indexRoute.guard;
    indexRoute.guard = null;
  }

  // push the non-root routes into root child collection
  mappedRoutes
    .filter(e => e.routePath !== '?' && e.routePath !== '**')
    .forEach(e => rootRoute.children.push(e));

  // reset root route path to ''
  rootRoute.routePath = '';

  // Redirects need to be before '**' catch all
  let declarations = generateRedirects(skyAppConfig)
    .concat(baseRoutes.map(r => generateRouteDeclaration(r)))
    .join(',\n');

  return `[\n${declarations}\n]`;
}

function generateRuntimeImports(skyAppConfig, routes) {
  const alias = skyAppConfig.runtime.spaPathAlias;
  return routes
    .filter(r => r.guard)
    .map(r => `import { ${r.guard.name} } from '${alias}/${r.guard.path.replace(/\.ts$/, '')}';`);
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
    routePath: route.routePath === '?' ? '' : route.routePath.replace(/\#/g, ''),
    routeParams: route.routeParams
  }));
}

function getRoutes(skyAppConfig) {
  const routes = generateRoutes(skyAppConfig);
  return {
    declarations: generateDeclarations(skyAppConfig, routes),
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
  // eslint-disable-next-line no-cond-assign
  while ((match = matchRegexp.exec(content))) {
    if (result !== undefined) {
      throw new Error(`As a best practice, only export one guard per file in ${file}`);
    }

    result = {
      path: file.replace(/\\/g, '/'),
      name: match[1],
      canActivate: content.match(/canActivate\s*\(/g) !== null,
      canDeactivate: content.match(/canDeactivate\s*\(/g) !== null,
      canActivateChild: content.match(/canActivateChild\s*\(/g) !== null
    };
  }

  return result;
}

module.exports = {
  getRoutes: getRoutes
};
