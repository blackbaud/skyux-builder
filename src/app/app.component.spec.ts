import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';

import {
  SkyAppConfig,
  SkyAppSearchResultsProvider,
  SkyAppStyleLoader,
  SkyAppWindowRef
} from '@blackbaud/skyux-builder/runtime';
import { BBHelp } from '@blackbaud/help-client';
import { BBOmnibar, BBOmnibarSearchArgs } from '@blackbaud/auth-client';

import { AppComponent } from './app.component';

describe('AppComponent', () => {

  let comp: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let parseParams: any;
  let searchArgs: BBOmnibarSearchArgs;
  let navigateByUrlParams: any;
  let subscribeHandler: any;
  let scrollCalled: boolean = false;
  let skyAppConfig: any;

  const location = 'my-custom-location';
  const defaultSkyAppConfig: any = {
    runtime: {
      app: {
        base: 'app-base'
      },
      params: {
        getAllKeys: () => [],
        parse: (p) => parseParams = p
      }
    },
    skyux: {
      host: {
        url: 'host-url'
      }
    }
  };

  function setup(
    config: any,
    includeSearchProvider?: boolean,
    styleLoadError?: any
  ) {
    let providers = [
      {
        provide: Router,
        useValue: {
          events: {
            subscribe: handler => subscribeHandler = handler
          },
          navigateByUrl: url => navigateByUrlParams = url
        }
      },
      {
        provide: SkyAppWindowRef,
        useValue: {
          nativeWindow: {
            location: location,
            scroll: () => scrollCalled = true
          }
        }
      },
      {
        provide: SkyAppConfig,
        useValue: config
      },
      {
        provide: SkyAppStyleLoader,
        useValue: {
          loadStyles: () => Promise.resolve(styleLoadError)
        }
      }
    ];

    if (includeSearchProvider) {
      providers.push({
        provide: SkyAppSearchResultsProvider,
        useValue: {
          getSearchResults: sa => searchArgs = sa
        }
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
      comp    = fixture.componentInstance;
    });
  }

  // Reset skyAppConfig
  beforeEach(() => {
    skyAppConfig = defaultSkyAppConfig;
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

  it('should not call BBOmnibar.load if config.skyux.omnibar does not exist', async(() => {
    let spyOmnibar = spyOn(BBOmnibar, 'load');
    setup(skyAppConfig).then(() => {
      fixture.detectChanges();
      expect(spyOmnibar).not.toHaveBeenCalled();
    });
  }));

  it('should call BBOmnibar.load if config.skyux.omnibar exists', async(() => {
    let spyOmnibar = spyOn(BBOmnibar, 'load');
    skyAppConfig.skyux.omnibar = {};
    setup(skyAppConfig).then(() => {
      fixture.detectChanges();
      expect(spyOmnibar).toHaveBeenCalled();
    });
  }));

  it('should set the onSearch property if a search provider is provided', async(() => {
    let spyOmnibar = spyOn(BBOmnibar, 'load');
    skyAppConfig.skyux.omnibar = {};
    setup(skyAppConfig, true).then(() => {
      fixture.detectChanges();
      expect(spyOmnibar.calls.first().args[0].onSearch).toBeDefined();
    });
  }));

  it('should call the search provider getSearchResults in the onSearch callback', async(() => {
    let spyOmnibar = spyOn(BBOmnibar, 'load');
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

  it('should set the allowed params on the omnibar config', async(() => {
    let spyOmnibar = spyOn(BBOmnibar, 'load');
    skyAppConfig.skyux.omnibar = {};
    skyAppConfig.skyux.params = ['asdf'];
    skyAppConfig.runtime.params.getAllKeys = () => ['asdf'];
    skyAppConfig.runtime.params.get = (key) => 'jkl';
    setup(skyAppConfig, true).then(() => {
      fixture.detectChanges();
      expect(spyOmnibar.calls.first().args[0].asdf).toEqual('jkl');
    });
  }));

  it('should use the omnibarConfigMap key if it exists', async(() => {
    let spyOmnibar = spyOn(BBOmnibar, 'load');
    skyAppConfig.skyux.omnibar = {};
    skyAppConfig.skyux.params = ['envid'];
    skyAppConfig.runtime.params.getAllKeys = () => ['envid'];
    skyAppConfig.runtime.params.get = (key) => 'envidValue';
    setup(skyAppConfig, true).then(() => {
      fixture.detectChanges();

      // Notice envid => envId
      expect(spyOmnibar.calls.first().args[0].envId).toEqual('envidValue');
    });
  }));

  it('should not create BBOmnibarNavigation if omnibar.nav is set', async(() => {
    let spyOmnibar = spyOn(BBOmnibar, 'load');
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
    let spyOmnibar = spyOn(BBOmnibar, 'load');
    skyAppConfig.skyux.omnibar = {
      nav: {
        services: [
          { },
          { }
        ]
      }
    };

    setup(skyAppConfig, false).then(() => {
      fixture.detectChanges();
      expect(spyOmnibar.calls.first().args[0].nav.services[0].selected).toEqual(true);
    });
  }));

  it('should not markt he first service as select if another one is already marked', async(() => {
    let spyOmnibar = spyOn(BBOmnibar, 'load');
    skyAppConfig.skyux.omnibar = {
      nav: {
        services: [
          { },
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
    let spyOmnibar = spyOn(BBOmnibar, 'load');

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

    setup(skyAppConfig, false).then(() => {
      fixture.detectChanges();
      const items = spyOmnibar.calls.first().args[0].nav.services[0].items;
      expect(items[0].url).toEqual('ignored.com');
      expect(items[1].url).toEqual('base.com/custom-base/custom-route');
      expect(items[2].items[0].url).toEqual('base.com/custom-base/another-custom-route');
      expect(items[2].items[1].url).toEqual('another-ignored.com');
    });
  }));

  it('should add the beforeNavCallback', async(() => {
    let spyOmnibar = spyOn(BBOmnibar, 'load');

    skyAppConfig.skyux.host.url = 'base.com/';
    skyAppConfig.runtime.app.base = 'custom-base/';

    setup(skyAppConfig, false).then(() => {
      fixture.detectChanges();
      expect(spyOmnibar.calls.first().args[0].nav.beforeNavCallback).toBeDefined();
    });
  }));

  it('should call navigateByUrl, return false in the beforeNavCallback if local link', async(() => {
    let spyOmnibar = spyOn(BBOmnibar, 'load');

    skyAppConfig.skyux.host.url = 'base.com/';
    skyAppConfig.runtime.app.base = 'custom-base/';

    setup(skyAppConfig, false).then(() => {
      fixture.detectChanges();
      const cb = spyOmnibar.calls.first().args[0].nav.beforeNavCallback;

      const globalLink = cb({ url: 'asdf.com' });
      expect(globalLink).not.toBeDefined();
      expect(navigateByUrlParams).not.toBeDefined();

      const localLink = cb({ url: 'base.com/custom-base/new-place' });
      expect(localLink).toEqual(false);
      expect(navigateByUrlParams).toEqual('/new-place');
    });
  }));

  it('should handle no public routes during serve', async(() => {
    let spyOmnibar = spyOn(BBOmnibar, 'load');
    skyAppConfig.runtime.command = 'serve';
    skyAppConfig.skyux.routes = {};

    setup(skyAppConfig, false).then(() => {
      fixture.detectChanges();
      expect(spyOmnibar.calls.first().args[0].nav.localNavItems).not.toBeDefined();
    });
  }));

  it('should add global public routes as localNavItems during serve', async(() => {
    let spyOmnibar = spyOn(BBOmnibar, 'load');

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

    setup(skyAppConfig, false).then(() => {
      fixture.detectChanges();
      expect(spyOmnibar.calls.first().args[0].nav.localNavItems[0]).toEqual({
        title: 'my-name',
        url: 'base.com/custom-base/my-route',
        data: {
          global: true,
          name: 'my-name',
          route: '/my-route'
        }
      });
    });
  }));

  it('should not call BBHelp.load if config.skyux.help does not exist', async(() => {
    let spyHelp = spyOn(BBHelp, 'load');
    setup(skyAppConfig).then(() => {
      fixture.detectChanges();
      expect(spyHelp).not.toHaveBeenCalled();
    });
  }));

  it('should pass help config to BBHelp.load', async(() => {
    let spyHelp = spyOn(BBHelp, 'load');
    skyAppConfig.skyux.help = 'help-config';
    setup(skyAppConfig).then(() => {
      fixture.detectChanges();
      expect(spyHelp).toHaveBeenCalledWith(skyAppConfig.skyux.help);
    });
  }));

  it('should set isReady after SkyAppStyleLoader.loadStyles is resolved', async(() => {
    setup(skyAppConfig).then(() => {
      expect(comp.isReady).toEqual(true);
    });
  }));

  it('should pass SkyAppStyleLoader error through resolve and console.log it', async(() => {
    const result = {
      error: {
        message: 'my-error'
      }
    };

    spyOn(console, 'log');
    setup(skyAppConfig, false, result).then(() => {
      expect(comp.isReady).toEqual(true);
      expect(console.log).toHaveBeenCalledWith(result.error.message);
    });
  }));
});
