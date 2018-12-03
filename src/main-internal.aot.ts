import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

import { SkyAppBootstrapper } from '@skyux-sdk/builder/runtime/bootstrapper';

// We can now use the dynamic bootstrapper with @ngtools/webpack.
// See: https://blog.craftlab.hu/multiple-solutions-for-angular-ahead-of-time-aot-compilation-c474d9a0d508#71de

SkyAppBootstrapper.processBootstrapConfig().then(() => {
  platformBrowserDynamic().bootstrapModule(AppModule);
});
