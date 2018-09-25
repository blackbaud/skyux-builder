import {
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  Optional
} from '@angular/core';

import {
  NavigationEnd,
  Router
} from '@angular/router';

import {
  BBOmnibar,
  BBOmnibarNavigation,
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

require('style-loader!@skyux/theme/css/sky.css');
require('style-loader!./app.component.scss');

let omnibarLoaded: boolean;

function fixUpUrl(baseUrl: string, route: string, config: SkyAppConfig) {
  return config.runtime.params.getUrl(baseUrl + route);
}

function fixUpNavItems(items: any[], baseUrl: string, config: SkyAppConfig) {
  for (const item of items) {
    if (!item.url && item.route) {
      item.url = fixUpUrl(baseUrl, item.route, config);
    }

    if (item.items) {
      fixUpNavItems(item.items, baseUrl, config);
    }
  }
}

function fixUpNav(nav: any, baseUrl: string, config: SkyAppConfig) {
  const services = nav.services;

  if (services && services.length > 0) {
    let foundSelectedService = false;

    for (const service of services) {
      if (service.items) {
        fixUpNavItems(service.items, baseUrl, config);
      }

      if (service.selected) {
        foundSelectedService = true;
      }
    }

    if (!foundSelectedService) {
      services[0].selected = true;
    }
  }
}

@Component({
  selector: 'sky-pages-app',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  public isReady = false;

  constructor(
    private router: Router,
    private windowRef: SkyAppWindowRef,
    private config: SkyAppConfig,
    private styleLoader: SkyAppStyleLoader,
    @Optional() private helpInitService?: HelpInitializationService,
    @Optional() private searchProvider?: SkyAppSearchResultsProvider,
    @Optional() viewport?: SkyAppViewportService,
    @Optional() private zone?: NgZone,
    @Optional() private omnibarProvider?: SkyAppOmnibarProvider
  ) {
    this.styleLoader.loadStyles()
      .then((result?: any) => {
        this.isReady = true;

        if (result && result.error) {
          console.log(result.error.message);
        }

        // Let the isReady property take effect on the CSS class that hides/shows
        // content based on when styles are loaded.
        setTimeout(() => {
          viewport.visible.next(true);
        });
      });
  }

  public ngOnInit() {

    // Without this code, navigating to a new route doesn't cause the window to be
    // scrolled to the top like the browser does automatically with non-SPA navigation
    // when no route fragment is present.
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        const urlTree = this.router.parseUrl(event.url);
        if (!urlTree.fragment) {
          this.windowRef.nativeWindow.scroll(0, 0);
        }
      }
    });
    this.initShellComponents();
  }

  public ngOnDestroy() {
    if (omnibarLoaded) {
      BBOmnibar.destroy();
      omnibarLoaded = false;
    }
  }

  // Only pass params that omnibar config cares about
  // Internally we store as envid/svcid but auth-client wants envId/svcId
  private setParamsFromQS(omnibarConfig: any) {
    const map: { [key: string]: string } = {
      envid: 'envId',
      leid: 'leId',
      svcid: 'svcId'
    };

    Object.keys(map).forEach((key: string) => {
      if (this.config.runtime.params.has(key)) {
        omnibarConfig[map[key]] = this.config.runtime.params.get(key);
      }
    });
  }

  private setOnSearch(omnibarConfig: any) {
    if (this.searchProvider) {
      omnibarConfig.onSearch = (searchArgs: BBOmnibarSearchArgs) => {
        return this.searchProvider.getSearchResults(searchArgs);
      };
    }
  }

  private setNav(omnibarConfig: any) {
    const skyuxConfig = this.config.skyux;

    const baseUrl =
      (
        skyuxConfig.host.url +
        this.config.runtime.app.base.substr(0, this.config.runtime.app.base.length - 1)
      ).toLowerCase();

    let nav: BBOmnibarNavigation;

    if (omnibarConfig.nav) {
      nav = omnibarConfig.nav;
      fixUpNav(nav, baseUrl, this.config);
    } else {
      nav = omnibarConfig.nav = {};
    }

    nav.beforeNavCallback = (item: BBOmnibarNavigationItem) => {
      const url = item.url.toLowerCase();

      if (
        url === baseUrl ||
        // Make sure the base URL is not simply a partial match of the base URL plus additional
        // characters after the base URL that are not "terminating" characters
        url.indexOf(baseUrl + '/') === 0 ||
        url.indexOf(baseUrl + '?') === 0
      ) {
        const routePath = item.url.substring(baseUrl.length, url.length);

        // Since the omnibar is loaded outside Angular, navigating needs to be explicitly
        // run inside the Angular zone in order for navigation to work properly.
        this.zone.run(() => {
          this.router.navigateByUrl(routePath);
        });

        return false;
      }

      return true;
    };

    if (this.config.runtime.command === 'serve') {
      // Add any global routes to the omnibar as a convenience to the developer.
      const globalRoutes =
        skyuxConfig.routes &&
        skyuxConfig.routes.public &&
        skyuxConfig.routes.public.filter((value: any) => {
          return value.global;
        });

      if (globalRoutes) {
        const localNavItems: BBOmnibarNavigationItem[] = [];

        for (const route of globalRoutes) {
          localNavItems.push({
            title: route.name,
            url: fixUpUrl(baseUrl, route.route, this.config),
            data: route
          });
        }

        nav.localNavItems = localNavItems;
      }
    }
  }

  private setOmnibarArgsOverrides(omnibarConfig: any, args: SkyAppOmnibarReadyArgs) {
    if (args) {
      // Eventually this could be expanded to allow any valid config property to be overridden,
      // but for now keep it scoped to the two parameters we know consumers will want to override.
      if (args.hasOwnProperty('envId')) {
        omnibarConfig.envId = args.envId;
      }

      if (args.hasOwnProperty('svcId')) {
        omnibarConfig.svcId = args.svcId;
      }
    }
  }

  private initShellComponents() {
    const omnibarConfig = this.config.skyux.omnibar;
    const helpConfig = this.config.skyux.help;
    const skyuxHost = (this.windowRef.nativeWindow as any).SKYUX_HOST;

    const loadOmnibar = (args?: SkyAppOmnibarReadyArgs) => {
      this.setParamsFromQS(omnibarConfig);
      this.setNav(omnibarConfig);
      this.setOnSearch(omnibarConfig);

      if (helpConfig) {
        omnibarConfig.enableHelp = true;
      }

      omnibarConfig.allowAnonymous = !this.config.skyux.auth;

      this.setOmnibarArgsOverrides(omnibarConfig, args);

      // The omnibar uses setInterval() to poll for user activity, and setInterval()
      // triggers change detection on each interval.  Loading the omnibar outside
      // Angular will keep change detection from being triggered during each interval.
      this.zone.runOutsideAngular(() => {
        BBOmnibar.load(omnibarConfig);
        omnibarLoaded = true;
      });
    };

    if (this.config.runtime.command === 'e2e') {
      this.windowRef.nativeWindow.addEventListener('message', (event: MessageEvent) => {
        if (event.data.messageType === 'sky-navigate-e2e') {
          this.router.navigate(event.data.url);
        }
      });
    }

    if (this.config.runtime.params.get('addin') !== '1') {
      if (omnibarConfig) {
        if (this.omnibarProvider) {
          this.omnibarProvider.ready().then(loadOmnibar);
        } else {
          loadOmnibar();
        }
      }

      if (helpConfig && this.helpInitService) {
        if (this.config.runtime.params.has('svcid')) {
          helpConfig.extends = this.config.runtime.params.get('svcid');
        }

        if (skyuxHost && !helpConfig.locale) {
          const browserLanguages = skyuxHost.acceptLanguage || '';
          helpConfig.locale = browserLanguages.split(',')[0];
        }

        this.helpInitService.load(helpConfig);
      }
    }
  }
}
