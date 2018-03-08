import {
  NgModule
} from '@angular/core';

import {
  SkyAppLinkDirective
} from './directives';

@NgModule({
  declarations: [
    SkyAppLinkDirective
  ],
  exports: [
    SkyAppLinkDirective
  ],
  providers: []
})
/* istanbul ignore next */
export class SkyAppRuntimeModule { }
