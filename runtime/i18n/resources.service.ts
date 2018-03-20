import {
  forwardRef,
  Inject,
  Injectable,
  Optional
} from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/publishReplay';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { SkyAppAssetsService } from '@blackbaud/skyux-builder/runtime/assets.service';

import {
  SkyAppLocaleProvider
} from '@blackbaud/skyux-builder/runtime/i18n/locale-provider';

import {
  SkyAppHostLocaleProvider
} from '@blackbaud/skyux-builder/runtime/i18n/host-locale-provider';

import { SkyAppFormat } from '@blackbaud/skyux-builder/runtime/format';

const defaultResources: {[key: string]: {message: string}} = {};

function getDefaultObs() {
  return Observable.of({
    'en_US': defaultResources
  });
}

/**
 * An Angular service for interacting with resource strings.
 */
@Injectable()
export class SkyAppResourcesService {
  private resourcesObs: Observable<any>;
  private skyAppFormat: SkyAppFormat;

  constructor(
    /* tslint:disable-next-line no-forward-ref */
    @Inject(forwardRef(() => SkyAppAssetsService)) private assets: SkyAppAssetsService,
    @Optional() @Inject(SkyAppHostLocaleProvider) private localeProvider: SkyAppLocaleProvider
  ) {
    this.skyAppFormat = new SkyAppFormat();
  }

  /**
   * Gets a resource string based on its name.
   * @param name The name of the resource string.
   */
  public getString(name: string, ...args: any[]): Observable<string> {
    if (!this.resourcesObs) {
      const localeObs = this.localeProvider.getLocaleInfo();

      this.resourcesObs = localeObs
        .switchMap((localeInfo) => {
          let obs: Observable<any>;
          let resources: string;

          const locale = localeInfo.locale;

          if (locale) {
            resources =
              this.getResourcesForLocale(locale) ||
              // Try falling back to the non-region-specific language.
              this.getResourcesForLocale(locale.substr(0, 2));
          }

          // Finally fall back to the default locale.
          resources = resources || this.getResourcesForLocale(
            SkyAppHostLocaleProvider.defaultLocale
          );

          if (resources) {
            obs = Observable.of(resources);
          } else {
            obs = getDefaultObs();
          }

          return obs;
        })
        .catch(() => getDefaultObs());
    }

    return this.resourcesObs.map((
      resources: {[key: string]: {message: string}}
    ): string => {
      if (name in resources) {
        return this.skyAppFormat.formatText(resources[name].message, ...args);
      }

      return name;
    });
  }

  private getResourcesForLocale(locale: string): any {
    return this.assets.getResourcesForLocale(locale.replace('-', '_'));
  }
}
