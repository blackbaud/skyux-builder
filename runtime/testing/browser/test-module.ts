import { NgModule } from '@angular/core';

import { APP_BASE_HREF } from '@angular/common';

import { RouterTestingModule } from '@angular/router/testing';

import { SkyPagesModule } from '../../../src/app/sky-pages.module';

import { SkyAppResourcesService } from '@skyux/i18n';

import { SkyAppResourcesTestService } from '@skyux/i18n/src/app/public/testing';

@NgModule({
  imports: [
    RouterTestingModule,
    SkyPagesModule
  ],
  providers: [
    {
      provide: APP_BASE_HREF,
      useValue : '/'
    },
    {
      provide: SkyAppResourcesService,
      useClass: SkyAppResourcesTestService
    }
  ]
})
export class SkyAppTestModule { }
