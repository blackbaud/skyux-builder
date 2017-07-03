import { Injectable } from '@angular/core';

@Injectable()
export class SkyAppResourcesService {
  public getResources() {
    return require('json-loader!sky-pages-spa/src/assets/locales/resources_en_US.json');
  }
}
