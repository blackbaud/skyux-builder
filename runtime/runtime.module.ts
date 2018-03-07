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
export class SkyAppRuntimeModule { }
