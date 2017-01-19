import { platformBrowser } from '@angular/platform-browser';
import { AppModuleNgFactory } from './ngfactory/app/app.module.ngfactory';

import { SkyAppBootstrapper } from '../runtime/bootstrapper';

SkyAppBootstrapper.beforeBootstrap().then(() => {
  platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);
});
