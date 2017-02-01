import { platformBrowser } from '@angular/platform-browser';
import { AppModuleNgFactory } from './ngfactory/app/app.module.ngfactory';

import { SkyAppBootstrapper } from '@blackbaud/skyux-builder/runtime/bootstrapper';

SkyAppBootstrapper.processBootstrapConfig().then(() => {
  platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);
});
