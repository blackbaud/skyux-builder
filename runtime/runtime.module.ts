import {
  NgModule
} from '@angular/core';

import {
  SkyAppRouterLinkModule
} from '@skyux/router/modules/link/link.module';

import {
  SkyI18nModule
} from '@skyux/i18n/i18n.module';

@NgModule({
  imports: [
    SkyAppRouterLinkModule,
    SkyI18nModule
  ],
  exports: [
    SkyAppRouterLinkModule,
    SkyI18nModule
  ]
})
export class SkyAppRuntimeModule { }
