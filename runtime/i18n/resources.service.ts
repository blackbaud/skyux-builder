import { Injectable } from '@angular/core';

@Injectable()
export class SkyAppResourcesService {
  public getResources() {
    // V1 will always return the English file, future versions will be more dynamic
    return require('json-loader!sky-pages-spa/src/assets/locales/resources_en_US.json');
  }
}
