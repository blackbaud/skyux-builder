declare var module: any;

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

import { SkyAppBootstrapper } from '../runtime/bootstrapper';

if (module.hot) {
  module.hot.accept();
}

SkyAppBootstrapper.processBootstrapConfig().then(() => {
  platformBrowserDynamic().bootstrapModule(AppModule);
});
