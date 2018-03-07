import {
  NgModule
} from '@angular/core';

import {
  SkyAppLinkDirective
} from './directives';

import {
  SkyAppHostLocaleProvider,
  SkyAppResourcesPipe,
  SkyAppResourcesService
} from './i18n';

import { SkyAppStyleLoader } from './style-loader';
import { SkyAppViewportService } from './viewport.service';

@NgModule({
  declarations: [
    SkyAppLinkDirective,
    SkyAppResourcesPipe
  ],
  exports: [
    SkyAppLinkDirective,
    SkyAppResourcesPipe
  ],
  providers: [
    SkyAppHostLocaleProvider,
    SkyAppResourcesService,
    SkyAppStyleLoader,
    SkyAppViewportService
  ]
})
export class SkyAppRuntimeModule { }
