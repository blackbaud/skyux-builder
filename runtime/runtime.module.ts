import {
  NgModule
} from '@angular/core';

import {
  SkyAppLinkModule
} from '@skyux/router/modules/link/link.module';

import {
  SkyI18nModule
} from '@skyux/i18n/modules/i18n/i18n.module';

@NgModule({
  imports: [
    SkyAppLinkModule,
    SkyI18nModule
  ],
  exports: [
    SkyAppLinkModule,
    SkyI18nModule
  ]
})
export class SkyAppRuntimeModule { }
