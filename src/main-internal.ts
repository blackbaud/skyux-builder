declare var module: any;

import {
  NgModuleRef
} from '@angular/core';

import {
  platformBrowserDynamic
} from '@angular/platform-browser-dynamic';

import {
  SkyAppBootstrapper
} from '@skyux-sdk/builder/runtime/bootstrapper';

import {
  AppModule
} from './app/app.module';

SkyAppBootstrapper
  .processBootstrapConfig()
  .then(() => platformBrowserDynamic().bootstrapModule(AppModule))
  .then((ngModuleRef: NgModuleRef<any>) => {
    if (module.hot) {
      module.hot.accept();
      module.hot.dispose(() => ngModuleRef.destroy());
    }
  });
