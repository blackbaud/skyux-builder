import { Pipe } from '@angular/core';
//import * as data from '/locales/resources_en_US.json';

@Pipe({
  name: 'SkyAppResources'
})
export class SkyAppResourcesPipe {

  transform(val) {
    let resources: any = require('json-loader!'+skyAppConfig.runtime.spaPathAlias+'src/assets/locales/resources_en.json');
    let stringObj: {_description: string, message: string} = this.resources[val];
    if(stringObj){
      return stringObj.message;
    } else {
      return val;
    }
  }
}
