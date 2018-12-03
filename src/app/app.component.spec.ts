import {
  NgZone
} from '@angular/core';

import {
  async,
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';

import {
  NavigationEnd,
  NavigationStart,
  Router
} from '@angular/router';

import {
  RouterTestingModule
} from '@angular/router/testing';

import {
  BBOmnibar,
  BBOmnibarConfig,
  BBOmnibarNavigationItem,
  BBOmnibarSearchArgs
} from '@blackbaud/auth-client';

import {
  HelpInitializationService
} from '@blackbaud/skyux-lib-help';

import {
  SkyAppConfig
} from '@skyux/config';

import {
  SkyAppWindowRef
} from '@skyux/core';

import {
  SkyAppOmnibarProvider,
  SkyAppOmnibarReadyArgs,
  SkyAppSearchResultsProvider
} from '@skyux/omnibar-interop';

import {
  SkyAppStyleLoader,
  SkyAppViewportService
} from '@skyux/theme';

import {
  AppComponent
} from './app.component';

describe('AppComponent', () => {
  let mockSkyuxHost: any;
  let mockWindow: any;
  let comp: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let searchArgs: BBOmnibarSearchArgs;
  let navigateParams: any;
  let navigateByUrlParams: any;
  let subscribeHandler: any;
  let scrollCalled: boolean = false;
  let skyAppConfig: any;
  let viewport: SkyAppViewportService;
  let spyOmnibarDestroy: any;

  class MockHelpInitService {
    public load() { }
  }

  class MockWindow {
    public nativeWindow = {
      location: {
        href: ''
      },
      SKYUX_HOST: mockSkyuxHost,
      scroll: () => scrollCalled = true,
      addEventListener: () => {}
    };
  }

  const mockHelpInitService = new MockHelpInitService();

  function setup(
    config: any,
    includeSearchProvider?: boolean,
    styleLoadPromise?: Promise<any>,
    omnibarProvider?: any
  ) {
    mockWindow = new MockWindow();
    const providers: any[] = [
      {
        provide: Router,
        useValue: {
          events: {
            subscribe: (handler: any) => subscribeHandler = handler
          },
          navigate: (params: any) => navigateParams = params,
          navigateByUrl: (url: string) => navigateByUrlParams = url,
          parseUrl: (url: string) => {
            return {
              fragment: (url === '') ? undefined : 'scroll-here'
            };
          }
        }
      },
      {
        provide: SkyAppWindowRef,
        useValue: mockWindow
      },
      {
        provide: SkyAppConfig,
        useValue: config
      },
      {
        provide: SkyAppStyleLoader,
        useValue: {
          loadStyles: () => styleLoadPromise || Promise.resolve()
        }
      },
      {
        provide: HelpInitializationService,
        useValue: mockHelpInitService
      },
      {
        provide: SkyAppViewportService,
        useValue: viewport
      }
    ];

    if (includeSearchProvider) {
      providers.push({
        provide: SkyAppSearchResultsProvider,
        useValue: {
          getSearchResults: (sa: any) => searchArgs = sa
        }
      });
    }

    if (omnibarProvider) {
      providers.push({
        provide: SkyAppOmnibarProvider,
        useValue: omnibarProvider
      });
    }

    return TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [
        RouterTestingModule
      ],
      providers: providers
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(AppComponent);
        comp = fixture.componentInstance;
      });
  }

  function validateOmnibarProvider(
    readyArgs: SkyAppOmnibarReadyArgs,
    expectedNotCalledWith?: any
  ) {
    const spyOmnibar = spyOn(BBOmnibar, 'load');

    skyAppConfig.skyux.omnibar = {};

    let readyPromiseResolve: (args: SkyAppOmnibarReadyArgs) => void;

    const readyPromise = new Promise<SkyAppOmnibarReadyArgs>((resolve) => {
      readyPromiseResolve = resolve;
    });

    setup(skyAppConfig, undefined, undefined, {
      ready: () => readyPromise
    }).then(() => {
      fixture.detectChanges();

      expect(spyOmnibar).not.toHaveBeenCalled();

      readyPromiseResolve(readyArgs);

      tick();

      expect(spyOmnibar).toHaveBeenCalledWith(jasmine.objectContaining(readyArgs));

      if (expectedNotCalledWith) {
        expect(spyOmnibar).not.toHaveBeenCalledWith(
          jasmine.objectContaining(expectedNotCalledWith)
        );
      }
    });
  }

  // Reset skyAppConfig and scrollCalled
  beforeEach(() => {
    skyAppConfig = {
      runtime: {
        app: {
          base: 'app-base'
        },
        params: {
          get: (key: any) => false,
          has: (key: any) => false,
          hasAllRequiredParams: () => true,
          parse: (p: any) => p
        }
      },
      skyux: {
        host: {
          url: 'host-url'
        }
      }
    };
    scrollCalled = false;
    viewport = new SkyAppViewportService();
    navigateParams = undefined;
    navigateByUrlParams = undefined;
    spyOmnibarDestroy = spyOn(BBOmnibar, 'destroy');
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create component', async(() => {
    setup(skyAppConfig).then(() => {
      expect(comp).toBeDefined();
    });
  }));

  it('should subscribe to router events and call scroll on NavigationEnd', async(() => {
    setup(skyAppConfig).then(() => {
      fixture.detectChanges();
      subscribeHandler(new NavigationStart(0, ''));
      expect(scrollCalled).toBe(false);

      subscribeHandler(new NavigationEnd(0, '', ''));
      expect(scrollCalled).toBe(true);
    });
  }));

  it('should not call scroll on NavigationEnd when a url fragment is present', async(() => {
    setup(skyAppConfig).then(() => {
      fixture.detectChanges();
      subscribeHandler(new NavigationEnd(0, '/#scroll-here', '/#scroll-here'));
      expect(scrollCalled).toBe(false);
    });
  }));

  it('should not call BBOmnibar.load if config.skyux.omnibar does not exist', async(() => {
    const spyOmnibar = spyOn(BBOmnibar, 'load');

    setup(skyAppConfig).then(() => {
      fixture.detectChanges();
      fixture.destroy();
      expect(spyOmnibar).not.toHaveBeenCalled();
      expect(spyOmnibarDestroy).not.toHaveBeenCalled();
    });
  }));

  it(
    'should load the omnibar outside Angular to avoid change detection during user activity checks',
    async(() => {
      const spyOmnibar = spyOn(BBOmnibar, 'load');

      skyAppConfig.skyux.omnibar = {};

      setup(skyAppConfig).then(() => {
        const zone = fixture.debugElement.injector.get(NgZone);

        let loadOmnibarCallback: Function;

        const runOutsideAngularSpy = spyOn(zone, 'runOutsideAngular').and.callFake(
          (cb: Function) => {
            if (cb && cb.toString().indexOf('BBOmnibar') >= 0) {
              loadOmnibarCallback = cb;
            } else {
              cb();
            }
          }
        );

        fixture.detectChanges();

        expect(runOutsideAngularSpy).toHaveBeenCalled();
        expect(spyOmnibar).not.toHaveBeenCalled();

        loadOmnibarCallback();

        expect(spyOmnibar).toHaveBeenCalled();
      });
    })
  );

  it(
    'should run omnibar navigation within the Angular zone',
    async(() => {
      skyAppConfig.skyux.host.url = 'base.com/';
      skyAppConfig.runtime.app.base = 'custom-base/';

      let beforeNavCallback: (item: BBOmnibarNavigationItem) => boolean | void;

      spyOn(BBOmnibar, 'load').and.callFake((config: BBOmnibarConfig) => {
        beforeNavCallback = config.nav.beforeNavCallback;
      });

      skyAppConfig.skyux.omnibar = {};

      setup(skyAppConfig).then(() => {
        const zone = fixture.debugElement.injector.get(NgZone);
        const router = fixture.debugElement.injector.get(Router);

        const navigateByUrlSpy = spyOn(router, 'navigateByUrl');

        let zoneRunCallback: Function;

        const runSpy = spyOn(zone, 'run').and.callFake(
          (cb: Function) => {
            if (cb && cb.toString().indexOf('navigateByUrl') >= 0) {
              zoneRunCallback = cb;
            } else {
              cb();
            }
          }
        );

        fixture.detectChanges();

        beforeNavCallback({
          title: '',
          url: 'base.com/custom-base/new-place'
        });

        expect(runSpy).toHaveBeenCalled();
        expect(navigateByUrlSpy).not.toHaveBeenCalled();

        zoneRunCallback();

        expect(navigateByUrlSpy).toHaveBeenCalled();
      });
    })
  );

  it('should call omnibar destroy if it was loaded', () => {
    const spyOmnibarLoad = spyOn(BBOmnibar, 'load');

    skyAppConfig.skyux.omnibar = {};

    setup(skyAppConfig).then(() => {
      fixture.detectChanges();
      fixture.destroy();
      expect(spyOmnibarLoad).toHaveBeenCalled();
      expect(spyOmnibarDestroy).toHaveBeenCalled();
    });
  });

  it('should not load the omnibar or help widget if the addin param is 1', () => {
    const spyOmnibar = spyOn(BBOmnibar, 'load');
    const spyHelp = spyOn(mockHelpInitService, 'load');

    skyAppConfig.runtime.params.get = (key: string) => key === 'addin' ? '1' : undefined;
    skyAppConfig.skyux.omnibar = true;

    setup(skyAppConfig).then(() => {
      fixture.detectChanges();
      expect(spyOmnibar).not.toHaveBeenCalled();
      expect(spyHelp).not.toHaveBeenCalled();
    });
  });

  it('should set the onSearch property if a search provider is provided', async(() => {
    const spyOmnibar = spyOn(BBOmnibar, 'load');

    skyAppConfig.skyux.omnibar = {};

    setup(skyAppConfig, true).then(() => {
      fixture.detectChanges();
      expect(spyOmnibar.calls.first().args[0].onSearch).toBeDefined();
    });
  }));

  it('should call the search provider getSearchResults in the onSearch callback', async(() => {
    const spyOmnibar = spyOn(BBOmnibar, 'load');

    skyAppConfig.skyux.omnibar = {};

    setup(skyAppConfig, true).then(() => {
      fixture.detectChanges();
      expect(spyOmnibar.calls.first().args[0].onSearch).toBeDefined();

      const search = {
        searchText: 'test-search'
      };
      spyOmnibar.calls.first().args[0].onSearch(search);
      expect(searchArgs).toEqual(search);
    });
  }));

  it('should set the allow anonymous flag based on the app\'s auth configuration', async(() => {
    const spyOmnibar = spyOn(BBOmnibar, 'load');

    skyAppConfig.skyux.omnibar = {};

    skyAppConfig.skyux.auth = true;

    setup(skyAppConfig, true).then(() => {
      fixture.detectChanges();

      expect(spyOmnibar).toHaveBeenCalledWith(
        jasmine.objectContaining({
          allowAnonymous: false
        })
      );
    });
  }));

  it('should set the known params on the omnibar config if they exist', async(() => {
    const spyOmnibar = spyOn(BBOmnibar, 'load');

    skyAppConfig.skyux.omnibar = {};

    skyAppConfig.skyux.params = ['envid', 'svcid', 'leid'];
    skyAppConfig.runtime.params.has = (key: any) => true;
    skyAppConfig.runtime.params.get = (key: any) => key + 'Value';
    setup(skyAppConfig, true).then(() => {
      fixture.detectChanges();

      // Notice envid => envId
      expect(spyOmnibar.calls.first().args[0].envId).toEqual('envidValue');

      // Notice svcid => svcId
      expect(spyOmnibar.calls.first().args[0].svcId).toEqual('svcidValue');

      // Notice svcid => svcId
      expect(spyOmnibar.calls.first().args[0].leId).toEqual('leidValue');
    });
  }));

  it('should not create BBOmnibarNavigation if omnibar.nav is set', async(() => {
    const spyOmnibar = spyOn(BBOmnibar, 'load');
    skyAppConfig.skyux.omnibar = {
      nav: {
        junk: true
      }
    };

    setup(skyAppConfig, false).then(() => {
      fixture.detectChanges();
      expect(spyOmnibar.calls.first().args[0].nav.junk).toEqual(true);
    });
  }));

  it('should mark first service as selected if no omnibar.nav.services are selected', async(() => {
    const spyOmnibar = spyOn(BBOmnibar, 'load');
    skyAppConfig.skyux.omnibar = {
      nav: {
        services: [
          {},
          {}
        ]
      }
    };

    setup(skyAppConfig, false).then(() => {
      fixture.detectChanges();
      expect(spyOmnibar.calls.first().args[0].nav.services[0].selected).toEqual(true);
    });
  }));

  it('should not mark the first service as selected if another one is already marked', async(() => {
    const spyOmnibar = spyOn(BBOmnibar, 'load');
    skyAppConfig.skyux.omnibar = {
      nav: {
        services: [
          {},
          { selected: true }
        ]
      }
    };

    setup(skyAppConfig, false).then(() => {
      fixture.detectChanges();
      expect(spyOmnibar.calls.first().args[0].nav.services[1].selected).toEqual(true);
    });
  }));

  it('should recursively set the url property to omnibar.nav.services.items', async(() => {
    const spyOmnibar = spyOn(BBOmnibar, 'load');

    skyAppConfig.skyux.host.url = 'base.com/';
    skyAppConfig.runtime.app.base = 'custom-base/';
    skyAppConfig.skyux.omnibar = {
      nav: {
        services: [
          {
            items: [
              {
                url: 'ignored.com'
              },
              {
                route: '/custom-route'
              },
              {
                items: [
                  {
                    route: '/another-custom-route'
                  },
                  {
                    url: 'another-ignored.com'
                  }
                ]
              }
            ]
          }
        ]
      }
    };

    skyAppConfig.runtime.params.getUrl = (url: string) => url + '?envid=abc';

    setup(skyAppConfig, false).then(() => {
      fixture.detectChanges();
      const items = spyOmnibar.calls.first().args[0].nav.services[0].items;
      expect(items[0].url).toEqual('ignored.com');
      expect(items[1].url).toEqual('base.com/custom-base/custom-route?envid=abc');
      expect(items[2].items[0].url).toEqual('base.com/custom-base/another-custom-route?envid=abc');
      expect(items[2].items[1].url).toEqual('another-ignored.com');
    });
  }));

  it('should add the beforeNavCallback', async(() => {
    const spyOmnibar = spyOn(BBOmnibar, 'load');

    skyAppConfig.skyux.omnibar = {};
    skyAppConfig.skyux.host.url = 'base.com/';
    skyAppConfig.runtime.app.base = 'custom-base/';

    setup(skyAppConfig, false).then(() => {
      fixture.detectChanges();
      expect(spyOmnibar.calls.first().args[0].nav.beforeNavCallback).toBeDefined();
    });
  }));

  it('should enable help for the omnibar when help config is present', async(() => {
    const spyOmnibar = spyOn(BBOmnibar, 'load');

    skyAppConfig.skyux.omnibar = {};
    skyAppConfig.skyux.help = {
      productId: 'test-config'
    };

    setup(skyAppConfig, false).then(() => {
      fixture.detectChanges();

      expect(spyOmnibar).toHaveBeenCalledWith(jasmine.objectContaining({
        enableHelp: true
      }));
    });
  }));

  it('should call navigateByUrl, return false in the beforeNavCallback if local link', async(() => {
    const spyOmnibar = spyOn(BBOmnibar, 'load');

    skyAppConfig.skyux.omnibar = {};
    skyAppConfig.skyux.host.url = 'base.com/';
    skyAppConfig.runtime.app.base = 'custom-base/';

    setup(skyAppConfig, false).then(() => {
      fixture.detectChanges();
      const cb = spyOmnibar.calls.first().args[0].nav.beforeNavCallback;

      const globalLink = cb({ url: 'asdf.com' });
      expect(globalLink).toEqual(true);
      expect(navigateByUrlParams).not.toBeDefined();

      const localLink = cb({ url: 'base.com/custom-base/new-place' });
      expect(localLink).toEqual(false);
      expect(navigateByUrlParams).toEqual('/new-place');
    });
  }));

  it('should handle global links that start with the same base URL as the SPA', async(() => {
    const spyOmnibar = spyOn(BBOmnibar, 'load');

    skyAppConfig.skyux.omnibar = {};
    skyAppConfig.skyux.host.url = 'base.com/';
    skyAppConfig.runtime.app.base = 'custom-base/';

    setup(skyAppConfig, false).then(() => {
      fixture.detectChanges();
      const cb = spyOmnibar.calls.first().args[0].nav.beforeNavCallback;

      const globalLink = cb({ url: 'base.com/custom-base-2' });
      expect(globalLink).toEqual(true);
      expect(navigateByUrlParams).not.toBeDefined();
    });
  }));

  it('should use the original url casing if calling navigateByUrl', async(() => {
    const spyOmnibar = spyOn(BBOmnibar, 'load');

    skyAppConfig.skyux.omnibar = {};
    skyAppConfig.skyux.host.url = 'base.com/';
    skyAppConfig.runtime.app.base = 'custom-base/';

    setup(skyAppConfig, false).then(() => {
      fixture.detectChanges();
      const cb = spyOmnibar.calls.first().args[0].nav.beforeNavCallback;

      const localLink = cb({ url: 'base.com/custom-base/new-place?envid=AbCd' });
      expect(localLink).toEqual(false);
      expect(navigateByUrlParams).toEqual('/new-place?envid=AbCd');
    });
  }));

  it('should handle no public routes during serve', async(() => {
    const spyOmnibar = spyOn(BBOmnibar, 'load');

    skyAppConfig.skyux.omnibar = {};
    skyAppConfig.runtime.command = 'serve';
    skyAppConfig.skyux.routes = {};

    setup(skyAppConfig, false).then(() => {
      fixture.detectChanges();
      expect(spyOmnibar.calls.first().args[0].nav.localNavItems).not.toBeDefined();
    });
  }));

  it('should add global public routes as localNavItems during serve', async(() => {
    const spyOmnibar = spyOn(BBOmnibar, 'load');

    skyAppConfig.skyux.omnibar = {};
    skyAppConfig.skyux.host.url = 'base.com/';
    skyAppConfig.runtime.app.base = 'custom-base/';
    skyAppConfig.runtime.command = 'serve';
    skyAppConfig.skyux.routes = {
      public: [
        {
          global: false
        },
        {
          global: true,
          name: 'my-name',
          route: '/my-route'
        }
      ]
    };

    skyAppConfig.runtime.params.getUrl = (url: string) => url + '?envid=123';

    setup(skyAppConfig, false).then(() => {
      fixture.detectChanges();
      expect(spyOmnibar.calls.first().args[0].nav.localNavItems[0]).toEqual({
        title: 'my-name',
        url: 'base.com/custom-base/my-route?envid=123',
        data: {
          global: true,
          name: 'my-name',
          route: '/my-route'
        }
      });
    });
  }));

  it('should not call HelpInitializationService.load if help config does not exist', async(() => {
    const spyHelp = spyOn(mockHelpInitService, 'load');
    setup(skyAppConfig).then(() => {
      fixture.detectChanges();
      expect(spyHelp).not.toHaveBeenCalled();
    });
  }));

  it('should pass help config to HelpInitializationService.load', async(() => {
    const spyHelp = spyOn(mockHelpInitService, 'load');
    skyAppConfig.skyux.help = { productId: 'test-config' };
    skyAppConfig.runtime.params.has = (key: any) => false;
    setup(skyAppConfig).then(() => {
      fixture.detectChanges();
      expect(spyHelp).toHaveBeenCalledWith(skyAppConfig.skyux.help);
    });
  }));

  it('should assign help config extends key to the svcid if one exists', async(() => {
    const spyHelp = spyOn(mockHelpInitService, 'load');
    const expectedCall = { productId: 'test-config', extends: 'help-extend' };
    skyAppConfig.skyux.help = { productId: 'test-config' };

    skyAppConfig.skyux.params = ['svcid'];
    skyAppConfig.runtime.params.has = (key: any) => key === 'svcid';
    skyAppConfig.runtime.params.get = (key: any) => key === 'svcid' ? 'help-extend' : false;

    setup(skyAppConfig).then(() => {
      fixture.detectChanges();
      expect(spyHelp).not.toHaveBeenCalledWith(skyAppConfig.skyux.help);
      expect(spyHelp).toHaveBeenCalledWith(expectedCall);
    });
  }));

  it('should assign help config locale key if none exist and host exposes the browser language', async(() => {
    const spyHelp = spyOn(mockHelpInitService, 'load');

    skyAppConfig.runtime.params.has = (key: any) => key === false;

    mockSkyuxHost = {
      acceptLanguage: 'fr-ca'
    };
    const expectedCall = { productId: 'test-config', extends: 'bb-help', locale: mockSkyuxHost.acceptLanguage };
    skyAppConfig.skyux.help = { productId: 'test-config', extends: 'bb-help' };

    setup(skyAppConfig).then(() => {
      fixture.detectChanges();
      expect(spyHelp).not.toHaveBeenCalledWith(skyAppConfig.skyux.help);
      expect(spyHelp).toHaveBeenCalledWith(expectedCall);
    });
  }));

  it('should fallback to \'\' for the locale if SKYUX_HOST.acceptLanguage does not exist', async(() => {
    const spyHelp = spyOn(mockHelpInitService, 'load');

    skyAppConfig.runtime.params.has = (key: any) => key === false;

    mockSkyuxHost = {};
    const expectedCall = { productId: 'test-config', extends: 'bb-help', locale: '' };
    skyAppConfig.skyux.help = { productId: 'test-config', extends: 'bb-help' };

    setup(skyAppConfig).then(() => {
      fixture.detectChanges();
      expect(spyHelp).not.toHaveBeenCalledWith(skyAppConfig.skyux.help);
      expect(spyHelp).toHaveBeenCalledWith(expectedCall);
    });
  }));

  it('should not override a locale that has been passed into the config', async(() => {
    const spyHelp = spyOn(mockHelpInitService, 'load');
    mockSkyuxHost = {
      acceptLanguage: 'fr-ca'
    };
    const expectedCall = { productId: 'test-config', extends: 'bb-help', locale: 'en-ga' };
    skyAppConfig.skyux.help = { productId: 'test-config', extends: 'bb-help', locale: 'en-ga' };

    setup(skyAppConfig).then(() => {
      fixture.detectChanges();
      expect(spyHelp).toHaveBeenCalledWith(skyAppConfig.skyux.help);
      expect(spyHelp).toHaveBeenCalledWith(expectedCall);
    });
  }));

  it('should set isReady after SkyAppStyleLoader.loadStyles is resolved', async(() => {
    setup(skyAppConfig).then(() => {
      expect(comp.isReady).toEqual(true);
    });
  }));

  it('should respond when SkyAppStyleLoader.loadStyles is resolved', fakeAsync(() => {
    let viewportVisible: boolean;

    let styleResolve: () => void;

    const stylePromise = new Promise((resolve) => {
      styleResolve = resolve;
    });

    viewport
      .visible
      .subscribe((value: boolean) => {
        viewportVisible = value;
      });

    setup(skyAppConfig, false, stylePromise);

    tick();

    expect(comp.isReady).toBe(false);
    expect(viewportVisible).toBeUndefined();

    styleResolve();
    tick();

    expect(comp.isReady).toBe(true);
    expect(viewportVisible).toBe(true);
  }));

  it('should pass SkyAppStyleLoader error through resolve and console.log it', async(() => {
    const result = {
      error: {
        message: 'my-error'
      }
    };

    spyOn(console, 'log');
    setup(skyAppConfig, false, Promise.resolve(result)).then(() => {
      expect(comp.isReady).toEqual(true);
      expect(console.log).toHaveBeenCalledWith(result.error.message);
    });
  }));

  it(
    'should load the omnibar when the omnibar provider\'s ready() promise is resolved',
    fakeAsync(() => {
      validateOmnibarProvider(
        {
          envId: '999',
          svcId: 'zzz'
        }
      );
    })
  );

  it('should consider the omnibar provider args envId property optional', fakeAsync(() => {
    validateOmnibarProvider(
      {
        envId: '999'
      },
      {
        svcId: jasmine.anything()
      }
    );
  }));

  it('should consider the omnibar provider args svcId property optional', fakeAsync(() => {
    validateOmnibarProvider(
      {
        svcId: 'zzz'
      },
      {
        envId: jasmine.anything()
      }
    );
  }));

  it('should add message event listener during e2e', async(() => {
    skyAppConfig.runtime.command = 'e2e';

    setup(skyAppConfig, false).then(() => {
      const spyEventListener = spyOn(mockWindow.nativeWindow, 'addEventListener');
      fixture.detectChanges();

      const goodUrl = 'some-route';
      const goodMessageType = 'sky-navigate-e2e';
      const badUrl = 'some-other-route';
      const badMessageType = 'navigate';

      const message = spyEventListener.calls.first().args[0];
      const eventListener = spyEventListener.calls.first().args[1];

      expect(message).toEqual('message');
      expect(spyEventListener).toHaveBeenCalled();

      // Trigger a valid message
      eventListener({
        data: {
          messageType: goodMessageType,
          url: goodUrl
        }
      });

      expect(navigateParams).toEqual(goodUrl);

      // Trigger an invalid message
      eventListener({
        data: {
          messageType: badMessageType,
          url: badUrl
        }
      });

      expect(navigateParams).not.toEqual(badUrl);
    });
  }));

});
