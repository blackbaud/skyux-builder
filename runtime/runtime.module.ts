import {
  NgModule
} from '@angular/core';

import {
  SkyI18nModule
} from '@skyux/i18n';

import {
  SkyAppLinkModule
} from '@skyux/router';

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
