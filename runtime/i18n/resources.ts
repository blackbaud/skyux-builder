import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'skyAppResources'
})
export class SkyAppResourcesPipe implements PipeTransform {
  public resources: any = require('json-loader!sky-pages-spa/src/assets/locales/resources_en_US.json');

  public transform(val) {
    let stringObj: {_description: string, message: string} = this.resources[val];
    if(stringObj){
      return stringObj.message;
    } else {
      return val;
    }
  }
}
