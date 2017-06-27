import { Pipe } from '@angular/core';

@Pipe({
  name: 'skyAppResources'
})
export class SkyAppResourcesPipe {

  public transform(val) {
    let resources: any = require('json-loader!../../../../../src/assets/locales/resources_en.json');
    let stringObj: {_description: string, message: string} = resources[val];
    if(stringObj){
      return stringObj.message;
    } else {
      return val;
    }
  }
}
