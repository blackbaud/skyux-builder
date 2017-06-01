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

  it('should not create BBOmnibarNavigation if the omnibar nav property is set', async(() => {

  }));

  it('should create BBOmnibarNavigation if the omnibar nav property is not set', async(() => {

  }));

  it('should add the beforeNavCallback', async(() => {

  }));

  it('should call navigateByUrl, return false in the beforeNavCallback if local link', async(() => {

  }));

  it('should add global routes to omnibar during serve', async(() => {

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
