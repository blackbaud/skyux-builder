import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

import { SkyAppBootstrapper } from '../runtime/bootstrapper';

SkyAppBootstrapper.processBootstrapConfig().then(() => {
  platformBrowserDynamic().bootstrapModule(AppModule);
});
