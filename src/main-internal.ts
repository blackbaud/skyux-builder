import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

import { SkyAppBootstrapper } from '../runtime/bootstrapper';

console.time('processing bootstrap config');
SkyAppBootstrapper.processBootstrapConfig().then(() => {
  platformBrowserDynamic().bootstrapModule(AppModule);
  console.timeEnd('processing bootstrap config');
  console.log('processing bootstrap config done ' + new Date().getTime());
});
