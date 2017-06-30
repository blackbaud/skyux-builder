import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'skyAppResources'
})
export class SkyAppResourcesPipe implements PipeTransform {
  public resources: any;

  public setup(resource: string) {
    this.resources = require('json-loader!' + resource);
  }

  public transform(val) {
    if (!this.resources) {
      this.resources = require
      ('json-loader!sky-pages-spa/src/assets/locales/resources_en_US.json');
    }
    let stringObj: {_description: string, message: string} = this.resources[val];
    if (stringObj) {
      return stringObj.message;
    } else {
      return val;
    }
  }
}
