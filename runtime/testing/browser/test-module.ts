import { NgModule } from '@angular/core';

import { APP_BASE_HREF } from '@angular/common';

import { RouterTestingModule } from '@angular/router/testing';

import { SkyPagesModule } from '../../../src/app/sky-pages.module';

import { SkyAppResourcesService } from '../../../runtime/i18n';
import { SkyAppResourcesTestService } from './i18n/resources-test.service';

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
