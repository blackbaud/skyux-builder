import { Injectable } from '@angular/core';

@Injectable()
export class SkyAppResourcesServiceMock {
  public getResources() {
    // V1 will always return the English file, future versions will be more dynamic
    return require('json-loader!./fixtures/resources_en_US.mock.json');
  }
}
