import { Injectable } from '@angular/core';

interface RuntimeConfigApp {
  base: string;
  inject: boolean;
  template: string;
}

interface RuntimeConfig {
  app: RuntimeConfigApp;
  command?: string;  // Dynamically added in "higher up" webpacks
  componentsPattern: string;
  handle404?: boolean;  // Dynamically added in sky-pages-module-generator.js
  routes?: Object[]; // Dynamically added in sky-pages-module-generator.js
  routesPattern: string;
  runtimeAlias: string;
  spaPathAlias: string;
  skyPagesOutAlias: string;
  skyuxPathAlias: string;
  srcPath: string;
  useTemplateUrl: boolean;
}

interface SkyuxConfigApp {
  externals?: Object;
  port?: string;
  title?: string;
}

interface SkyuxConfigHelp {
  serviceName?: string;
}

interface SkyuxConfigHost {
  url?: string;
}

interface SkyuxConfig {
  app?: SkyuxConfigApp;
  auth?: boolean;
  cssPath?: string;
  command?: string;
  compileMode?: string;
  help?: SkyuxConfigHelp;
  host?: SkyuxConfigHost;
  importPath?: string;
  mode?: string;
  name?: string;
  publicRoutes?: any[];
  omnibar?: any;
}

@Injectable()
export class SkyAppConfig {

  // Any properties dynamically added via code
  public static runtime: RuntimeConfig;

  // Any properties defined in or inherited from skyuxconfig.json / skyuxconfig.command.json
  public static skyux: SkyuxConfig;

}
