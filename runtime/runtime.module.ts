import {
  NgModule
} from '@angular/core';

import {
  SkyAppLinkDirective,
  SkyAppLinkExternalDirective
} from './directives';

@NgModule({
  declarations: [
    SkyAppLinkDirective,
    SkyAppLinkExternalDirective
  ],
  exports: [
    SkyAppLinkDirective,
    SkyAppLinkExternalDirective
  ]
})
/* istanbul ignore next */
export class SkyAppRuntimeModule { }
