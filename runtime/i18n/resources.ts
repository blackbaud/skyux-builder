import { SkyAppResourcesService } from './resources.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'skyAppResources'
})
export class SkyAppResourcesPipe implements PipeTransform {
  public resources: any;
  public resourcesService: SkyAppResourcesService = new SkyAppResourcesService();

  public transform(val) {
    this.resources = this.resourcesService.getResources();
    let stringObj: {_description: string, message: string} = this.resources[val];
    if (stringObj) {
      return stringObj.message;
    } else {
      return val;
    }
  }
}
