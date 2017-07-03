import { Injectable } from '@angular/core';

@Injectable()
export class SkyAppResourcesServiceMock {
  public getResources() {
    return require('json-loader!./fixtures/resources_en_US.mock.json');
  }
}
