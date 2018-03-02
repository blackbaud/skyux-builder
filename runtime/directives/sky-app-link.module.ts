import { NgModule } from '@angular/core';
import { SkyAppLinkDirective } from './sky-app-link.directive';

@NgModule({
  declarations: [
    SkyAppLinkDirective
  ],
  exports: [
    SkyAppLinkDirective
  ],
  providers: [
  ]
})
export class SkyAppRuntimeModule { }
