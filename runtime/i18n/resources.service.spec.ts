import {
  inject,
  TestBed
} from '@angular/core/testing';

import {
  HttpModule,
  Response,
  ResponseOptions,
  XHRBackend
} from '@angular/http';

import {
  MockBackend
} from '@angular/http/testing';

import { Observable } from 'rxjs/Observable';

import { SkyAppResourcesService } from '@blackbaud/skyux-builder/runtime/i18n/resources.service';
import { SkyAppAssetsService } from '@blackbaud/skyux-builder/runtime/assets.service';
import { SkyAppLocaleProvider } from '@blackbaud/skyux-builder/runtime/i18n/locale-provider';

describe('Resources service', () => {
  let resources: SkyAppResourcesService;
  let backend: MockBackend;
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
      SkyAppAssetsService,
      SkyAppResourcesService,
      {
        provide: XHRBackend,
        useClass: MockBackend
      },
      {
        provide: SkyAppAssetsService,
        useValue: {
          getUrl: (path) => {
            if (path.indexOf('en_AU') >= 0 || path.indexOf('es_MX') >= 0) {
              return undefined;
            }

            return 'https://example.com/' + path;
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
      imports: [HttpModule],
      providers: providers
    });
  }

  function injectServices() {
    return inject(
      [
        SkyAppAssetsService,
        SkyAppResourcesService,
        XHRBackend
      ],
      (
        _assets: SkyAppAssetsService,
        _resources: SkyAppResourcesService,
        _backend: MockBackend
      ) => {
        mockAssetsService = _assets;
        resources = _resources;
        backend = _backend;
      }
    );
  }

  function addTestResourceResponse() {
    backend.connections.subscribe((connection) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: testResources
        })
      ));
    });
  }

  describe('without a locale provider', () => {
    beforeEach(() => configureTestingModule());

    beforeEach(injectServices());

    it('should return the specified string', (done) => {
      addTestResourceResponse();

      resources.getString('hi').subscribe((value) => {
        expect(value).toBe('hello');
        done();
      });
    });

    it('should return the specified string formatted with the specified parameters', (done) => {
      addTestResourceResponse();

      resources.getString('template', 'a', 'b').subscribe((value) => {
        expect(value).toBe('format a me b a');
        done();
      });
    });

    it('should fall back to the resource name if no resource file exists', (done) => {
      addTestResourceResponse();

      mockAssetsService.getUrl = () => {
        return undefined;
      };

      resources.getString('hi').subscribe((value) => {
        expect(value).toBe('hi');
        done();
      });
    });

    it('should fall back to the resource name if parsing the resource file fails', (done) => {
      backend.connections.subscribe((connection) => {
        const response = new Response(
          new ResponseOptions({
            body: testResources
          })
        );

        spyOn(response, 'json').and.throwError('Error parsing document');

        connection.mockRespond(response);
      });

      resources.getString('hi').subscribe((value) => {
        expect(value).toBe('hi');
        done();
      });
    });

    it('only request the resource file once per instance', (done) => {
      let requestCount = 0;

      backend.connections.subscribe((connection) => {
        requestCount++;
        connection.mockRespond(new Response(
          new ResponseOptions({
            body: testResources
          })
        ));
      });

      resources.getString('hi').subscribe(() => {});

      resources.getString('hi').subscribe(() => {});

      resources.getString('hi').subscribe(() => {
        expect(requestCount).toBe(1);
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
      addTestResourceResponse();

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

        backend.connections.subscribe((connection) => {
          expect(connection.request.url).toBe('https://example.com/locales/resources_es.json');
          done();
        });

        currentLocale = 'es-MX';

        resources.getString('hi').subscribe((value) => { });
      }
    );

    it(
      'should fall back to the default locale if the specified locale does not have a ' +
      'corresponding resource file',
      (done) => {
        addTestResourceResponse();

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
        backend.connections.subscribe((connection) => {
          if (connection.request.url.indexOf('en_GB') >= 0) {
            connection.mockError(new Error());
          } else {
            connection.mockRespond(new Response(
              new ResponseOptions({
                body: testResources
              })
            ));
          }
        });

        currentLocale = 'en-GB';

        resources.getString('hi').subscribe((value) => {
          expect(value).toBe('hello');
          done();
        });
      }
    );

    it(
      'should fall back to the resource name if the specified locale is the default locale and ' +
      'the locale resource file fails to load',
      (done) => {
        backend.connections.subscribe((connection) => {
          connection.mockError(new Error());
        });

        currentLocale = 'en-US';

        resources.getString('hi').subscribe((value) => {
          expect(value).toBe('hi');
          done();
        });
      }
    );

    it(
      'should fall back to the resource name if the locale provider throws an error',
      (done) => {
        addTestResourceResponse();

        getLocaleInfo = () => Observable.throw(new Error());

        resources.getString('hi').subscribe((value) => {
          expect(value).toBe('hi');
          done();
        });
      }
    );

  });

});
