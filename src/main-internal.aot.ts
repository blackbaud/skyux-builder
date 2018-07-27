import { platformBrowser } from '@angular/platform-browser';
import { AppModuleNgFactory } from './ngfactory/app/app.module.ngfactory';

import { SkyAppBootstrapper } from '@skyux/builder-utils';

SkyAppBootstrapper.processBootstrapConfig().then(() => {
  platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);
});
