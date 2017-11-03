import { Injectable } from '@angular/core';
import { SkyAppRuntimeConfigParams } from './params';
import { SkyuxConfigParams } from './config-params';

export interface RuntimeConfigApp {
  base: string;
  inject: boolean;
  template: string;
}

export class SkyuxPactConfig {
  public providers?: {
    [provider: string]: {
      host?: string;
      port?: string;
      fullUrl?: string;
    }
  };
  public pactProxyServer?: string;
}

export interface RuntimeConfig {
  app: RuntimeConfigApp;
  command?: string;  // Dynamically added in "higher up" webpacks
  componentsPattern: string;
  componentsIgnorePattern: string;
  handle404?: boolean;  // Dynamically added in sky-pages-module-generator.js
  includeRouteModule: boolean;
  pactConfig?: SkyuxPactConfig;
  params: SkyAppRuntimeConfigParams;
  routes?: Object[]; // Dynamically added in sky-pages-module-generator.js
  routesPattern: string;
  runtimeAlias: string;
  spaPathAlias: string;
  skyPagesOutAlias: string;
  skyuxPathAlias: string;
  srcPath: string;
  useTemplateUrl: boolean;
}

export interface SkyuxConfigA11y {
  rules?: any;
}

export interface SkyuxConfigApp {
  externals?: Object;
  port?: string;
  title?: string;
}

export interface SkyuxConfigHost {
  url?: string;
}

export interface SkyuxConfig {
  a11y?: SkyuxConfigA11y | boolean;
  app?: SkyuxConfigApp;
  appSettings?: any;
  auth?: boolean;
  cssPath?: string;
  command?: string;
  compileMode?: string;
  help?: any;
  host?: SkyuxConfigHost;
  importPath?: string;
  mode?: string;
  name?: string;
  pacts?: any[];
  params?: SkyuxConfigParams; // List of allowed params
  plugins?: string[];
  redirects?: any;
  routes?: {
    public?: any[],
    referenced?: any[]
  };
  omnibar?: any;
  useHashRouting?: boolean;
}

@Injectable()
export class SkyAppConfig {

  // Any properties dynamically added via code
  public runtime: RuntimeConfig;

  // Any properties defined in or inherited from skyuxconfig.json / skyuxconfig.command.json
  public skyux: SkyuxConfig;

}
