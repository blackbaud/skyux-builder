import { forwardRef, Inject, Injectable } from '@angular/core';

import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { SkyAppAssetsService } from '@blackbaud/skyux-builder/runtime/assets.service';

let resourcesObs: Observable<any>;

/**
 * An Angular service for interacting with resource strings.
 */
@Injectable()
export class SkyAppResourcesService {
  constructor(
    private http: Http,
    /* tslint:disable-next-line no-forward-ref */
    @Inject(forwardRef(() => SkyAppAssetsService)) private assets: SkyAppAssetsService
  ) { }

  /**
   * Gets a resource string based on its name.
   * @param name The name of the resource string.
   */
  public getString(name: string): Observable<string> {
    if (!resourcesObs) {
      resourcesObs = this.http
        .get(this.assets.getUrl('locales/resources_en_US.json'))
        .share();
    }

    return resourcesObs.map((result): string => {
      const resources = result.json();

      if (name in resources) {
        return resources[name].message;
      }

      return name;
    });
  }
}
