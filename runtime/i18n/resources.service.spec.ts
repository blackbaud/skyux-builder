import {
  inject,
  TestBed
} from '@angular/core/testing';

import { Observable } from 'rxjs/Observable';

import { SkyAppWindowRef } from '@blackbaud/skyux-builder/runtime';

import { SkyAppResourcesService } from '@blackbaud/skyux-builder/runtime/i18n/resources.service';
import { SkyAppAssetsService } from '@blackbaud/skyux-builder/runtime/assets.service';
import { SkyAppLocaleProvider } from '@blackbaud/skyux-builder/runtime/i18n/locale-provider';

import {
  SkyAppHostLocaleProvider
} from '@blackbaud/skyux-builder/runtime/i18n/host-locale-provider';

import { SkyAppFormat } from '@blackbaud/skyux-builder/runtime/format';

describe('Resources service', () => {
  let resources: SkyAppResourcesService;
  let mockAssetsService: any;
  let testResources: any;

  function configureTestingModule(mockLocaleProvider?: any) {
    testResources = {
      'hi': {
        'message': 'hello'
      },
      'template': {
        'message': 'format {0} me {1} {0}'
      }
    };

    const providers: any[] = [
      SkyAppWindowRef,
      SkyAppAssetsService,
      SkyAppResourcesService,
      SkyAppFormat,
      SkyAppHostLocaleProvider,
      {
        provide: SkyAppAssetsService,
        useValue: {
          getUrl: (path: string) => {
            if (path.indexOf('en_AU') >= 0 || path.indexOf('es_MX') >= 0) {
              return undefined;
            }

            return 'https://example.com/' + path;
          },
          getResourcesForLocale(locale: string) {
            return testResources;
          }
        }
      }
    ];

    if (mockLocaleProvider) {
      providers.push({
        provide: SkyAppLocaleProvider,
        useValue: mockLocaleProvider
      });
    }

    TestBed.configureTestingModule({
      providers: providers
    });
  }

  function injectServices() {
    return inject(
      [
        SkyAppAssetsService,
        SkyAppResourcesService
      ],
      (
        _assets: SkyAppAssetsService,
        _resources: SkyAppResourcesService
      ) => {
        mockAssetsService = _assets;
        resources = _resources;
      }
    );
  }

  describe('without a locale provider', () => {
    beforeEach(() => configureTestingModule());

    beforeEach(injectServices());

    it('should return the specified string', (done) => {
      resources.getString('hi').subscribe((value) => {
        expect(value).toBe('hello');
        done();
      });
    });

    it('should return the specified string formatted with the specified parameters', (done) => {
      resources.getString('template', 'a', 'b').subscribe((value) => {
        expect(value).toBe('format a me b a');
        done();
      });
    });

    it('should fall back to the resource name if no resource exists', (done) => {
      resources.getString('fail').subscribe((value) => {
        expect(value).toBe('fail');
        done();
      });
    });
  });

  describe('with a locale provider', () => {
    let mockLocaleProvider: any;
    let currentLocale: any;
    let getLocaleInfo: any;

    beforeEach(() => {
      currentLocale = undefined;

      getLocaleInfo = () => Observable.of({
        locale: currentLocale
      });

      mockLocaleProvider = {
        getLocaleInfo: () => {
          return getLocaleInfo();
        }
      };

      configureTestingModule(mockLocaleProvider);
    });

    beforeEach(injectServices());

    it('should fall back to the default locale if a blank locale is specified', (done) => {
      currentLocale = '';

      resources.getString('hi').subscribe((value) => {
        expect(value).toBe('hello');
        done();
      });
    });

    it(
      'should fall back to the non-region-specific locale if the specified locale does not have ' +
      'corresponding resource file',
      (done) => {
        spyOn(mockAssetsService, 'getResourcesForLocale').and.returnValue(undefined);
        const spy = spyOn((resources as any), 'getResourcesForLocale').and.callThrough();

        currentLocale = 'es-MX';

        resources.getString('hi').subscribe((value) => {
          expect(spy).toHaveBeenCalledWith('es');
          done();
        });
      }
    );

    it(
      'should fall back to the default locale if the specified locale does not have a ' +
      'corresponding resource file',
      (done) => {
        currentLocale = 'en-AU';

        resources.getString('hi').subscribe((value) => {
          expect(value).toBe('hello');
          done();
        });
      }
    );

    it(
      'should fall back to the default locale if the specified locale file cannot be loaded',
      (done) => {
        currentLocale = 'en-GB';
        resources.getString('hi').subscribe((value) => {
          expect(value).toBe('hello');
          done();
        });
      }
    );

    it(
      'should fall back to the resource name if the locale provider throws an error',
      (done) => {
        getLocaleInfo = () => Observable.throw(new Error());

        resources.getString('hi').subscribe((value) => {
          expect(value).toBe('hi');
          done();
        });
      }
    );

  });

});
