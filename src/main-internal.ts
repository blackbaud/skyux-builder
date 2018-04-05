declare var module: any;

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

import { SkyAppBootstrapper } from '../runtime/bootstrapper';
import { hmrBootstrap } from './hmrBootstrap';

const bootstrap = () => platformBrowserDynamic().bootstrapModule(AppModule);

SkyAppBootstrapper.processBootstrapConfig().then(() => {
  if (module.hot) {
    hmrBootstrap(module, bootstrap);
  } else {
    bootstrap();
  }
});
