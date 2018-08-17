import {
  NgModule
} from '@angular/core';

import {
  SkyAppLinkDirective,
  SkyAppLinkExternalDirective
} from './directives';

import {
  SkyI18nModule
} from './i18n';

@NgModule({
  imports: [
    SkyI18nModule
  ],
  declarations: [
    SkyAppLinkDirective,
    SkyAppLinkExternalDirective
  ],
  exports: [
    SkyAppLinkDirective,
    SkyAppLinkExternalDirective,
    SkyI18nModule
  ]
})
/* istanbul ignore next */
export class SkyAppRuntimeModule { }
