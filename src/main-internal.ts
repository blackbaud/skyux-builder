declare var module: any;

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NgModuleRef } from '@angular/core';
import { AppModule } from './app/app.module';
import { SkyAppBootstrapper } from '../runtime/bootstrapper';

SkyAppBootstrapper
  .processBootstrapConfig()
  .then(() => platformBrowserDynamic().bootstrapModule(AppModule))
  .then((ngModuleRef: NgModuleRef<any>) => {
    if (module.hot) {
      module.hot.accept();
      module.hot.dispose(() => ngModuleRef.destroy());
    }
  });
