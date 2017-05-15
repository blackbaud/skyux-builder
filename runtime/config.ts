import { Injectable } from '@angular/core';
import { RuntimeConfigParams } from './params';

export interface RuntimeConfigApp {
  base: string;
  inject: boolean;
  template: string;
}

export interface RuntimeConfig {
  app: RuntimeConfigApp;
  command?: string;  // Dynamically added in "higher up" webpacks
  componentsPattern: string;
  handle404?: boolean;  // Dynamically added in sky-pages-module-generator.js
  includeRouteModule: boolean;
  params: RuntimeConfigParams;
  routes?: Object[]; // Dynamically added in sky-pages-module-generator.js
  routesPattern: string;
  runtimeAlias: string;
  spaPathAlias: string;
  skyPagesOutAlias: string;
  skyuxPathAlias: string;
  srcPath: string;
  useTemplateUrl: boolean;
}

export interface SkyuxConfigApp {
  externals?: Object;
  port?: string;
  title?: string;
}

// https://github.com/blackbaud/bb-help#configuration
export interface SkyuxConfigHelp {
  productId: string;
  helpBaseUrl: string;
  locale?: string;
  customLocales?: string;
  headerColor?: string;
  headerTextColor?: string;
  trainingCentralUrl?: string;
  knowledgebaseUrl?: string;
  caseCentralUrl?: string;
  helpCenterUrl?: string;
  hideUndock?: boolean;
  getChatData?(): any;
  getCurrentHelpKey(): string;
}

export interface SkyuxConfigHost {
  url?: string;
}

export interface SkyuxConfig {
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
  params?: string[]; // Array of allowed params
  plugins?: string[];
  publicRoutes?: any[];
  omnibar?: any;
}

@Injectable()
export class SkyAppConfig {

  // Any properties dynamically added via code
  public runtime: RuntimeConfig;

  // Any properties defined in or inherited from skyuxconfig.json / skyuxconfig.command.json
  public skyux: SkyuxConfig;

}
