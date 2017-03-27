import { OpaqueToken } from '@angular/core';
import { SkyAppBootstrapConfig } from './bootstrap-config';

export let SkyuxConfigProvider = new OpaqueToken('skyux.config');
export interface SkyuxConfig {
  app?: any;
  appSettings?: any;
  bootstrapConfig?: SkyAppBootstrapConfig;
  command?: string;
  compileMode?: string;
  host?: any;
  mode?: string;
  name?: string;
  publicRoutes?: any;
}

// Please note, SKYUX_CONFIG is added to this file at runtime
// but the interface above should accurately reflect its contents.
export let SKYUX_CONFIG: SkyuxConfig = {};
