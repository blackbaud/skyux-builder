import {
  forwardRef,
  Inject,
  Injectable,
  Optional
} from '@angular/core';

import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { SkyAppAssetsService } from '@blackbaud/skyux-builder/runtime/assets.service';
import { SkyAppLocaleProvider } from '@blackbaud/skyux-builder/runtime/i18n/locale-provider';
import { SkyAppLocaleInfo } from '@blackbaud/skyux-builder/runtime/i18n/locale-info';

const DEFAULT_LOCALE = 'en-US';

const defaultResources: {[key: string]: {message: string}} = {};

function getDefaultObs() {
  return Observable.of({
    json: (): any => {
      return defaultResources;
    }
  });
}

/**
 * An Angular service for interacting with resource strings.
 */
@Injectable()
export class SkyAppResourcesService {
  private resourcesObs: Observable<any>;

  private httpObs: {[key: string]: Observable<any>} = {};

  constructor(
    private http: Http,
    /* tslint:disable-next-line no-forward-ref */
    @Inject(forwardRef(() => SkyAppAssetsService)) private assets: SkyAppAssetsService,
    @Optional() private localeProvider: SkyAppLocaleProvider
  ) { }

  /**
   * Gets a resource string based on its name.
   * @param name The name of the resource string.
   */
  public getString(name: string): Observable<string> {
    if (!this.resourcesObs) {
      let localeObs: Observable<SkyAppLocaleInfo>;

      if (this.localeProvider) {
        localeObs = this.localeProvider.getLocaleInfo();
      } else {
        localeObs = Observable.of({
          locale: DEFAULT_LOCALE
        });
      }

      this.resourcesObs = localeObs
        .switchMap((localeInfo) => {
          let obs: Observable<any>;
          let resourcesUrl: string;

          const locale = localeInfo.locale;

          if (locale) {
            resourcesUrl =
              this.getUrlForLocale(locale) ||
              // Try falling back to the non-region-specific language.
              this.getUrlForLocale(locale.substr(0, 2));
          }

          // Finally fall back to the default locale.
          resourcesUrl = resourcesUrl || this.getUrlForLocale(DEFAULT_LOCALE);

          if (resourcesUrl) {
            obs = this.httpObs[resourcesUrl] || this.http
              .get(resourcesUrl)
              /* tslint:disable max-line-length */
              // publishReplay(1).refCount() will ensure future subscribers to
              // this observable will use a cached result.
              // https://stackoverflow.com/documentation/rxjs/8247/common-recipes/26490/caching-http-responses#t=201612161544428695958
              /* tslint:enable max-line-length */
              .publishReplay(1)
              .refCount()
              .catch(() => {
                // The resource file for the specified locale failed to load;
                // fall back to the default locale if it differs from the specified
                // locale.
                const defaultResourcesUrl = this.getUrlForLocale(DEFAULT_LOCALE);

                if (defaultResourcesUrl && defaultResourcesUrl !== resourcesUrl) {
                  return this.http.get(defaultResourcesUrl);
                }

                return getDefaultObs();
              });
          } else {
            obs = getDefaultObs();
          }

          this.httpObs[resourcesUrl] = obs;

          return obs;
        })
        // Don't keep trying after a failed attempt to load resources, or else
        // impure pipes like resources pipe that call this service will keep
        // firing requests indefinitely every few milliseconds.
        .catch(() => getDefaultObs());
    }

    return this.resourcesObs.map((result): string => {
      let resources: {[key: string]: {message: string}};

      try {
        // This can fail if the server returns a 200 but the file is invalid.
        resources = result.json();
      } catch (err) {
        resources = defaultResources;
      }

      if (name in resources) {
        return resources[name].message;
      }

      return name;
    });
  }

  private getUrlForLocale(locale: string): string {
    return this.assets.getUrl(`locales/resources_${locale.replace('-', '_')}.json`);
  }
}
