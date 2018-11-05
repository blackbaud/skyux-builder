import {
  platformBrowserDynamic
} from '@angular/platform-browser-dynamic';

import {
  SkyAppBootstrapper
} from '@blackbaud/skyux-builder/runtime/bootstrapper';

import {
  AppModule
} from './app/app.module';

SkyAppBootstrapper.processBootstrapConfig()
  .then(() => {
    platformBrowserDynamic().bootstrapModule(AppModule);
  });
