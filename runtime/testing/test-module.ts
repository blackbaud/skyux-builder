import {
  NgModule
} from '@angular/core';

import { RouterTestingModule } from '@angular/router/testing';

import { SkyPagesModule } from '../../src/app/sky-pages.module';

@NgModule({
  imports: [
    RouterTestingModule,
    SkyPagesModule
  ]
})
export class SkyAppTestModule { }
