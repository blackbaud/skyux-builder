import {
  NgModule
} from '@angular/core';

import {
  SkyAppLinkDirective,
  SkyAppLinkExternalDirective
} from './directives';

import {
  SkyAppHostLocaleProvider,
  SkyAppResourcesPipe,
  SkyAppResourcesService
} from './i18n';

@NgModule({
  declarations: [
    SkyAppLinkDirective,
    SkyAppLinkExternalDirective,
    SkyAppResourcesPipe
  ],
  exports: [
    SkyAppLinkDirective,
    SkyAppLinkExternalDirective,
    SkyAppResourcesPipe
  ],
  providers: [
    SkyAppHostLocaleProvider,
    SkyAppResourcesService
  ]
})
/* istanbul ignore next */
export class SkyAppRuntimeModule { }
