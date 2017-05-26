import {
  Component,
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

import { BBHelp } from '@blackbaud/help-client';

import {
  SkyAppConfig,
  SkyAppSearchResultsProvider,
  SkyAppWindowRef
} from '@blackbaud/skyux-builder/runtime';

require('style-loader!@blackbaud/skyux/dist/css/sky.css');
require('style-loader!./app.component.scss');

function fixUpNavItems(items: any[], baseUrl: string) {
  for (const item of items) {
    if (!item.url && item.route) {
      item.url = baseUrl + item.route;
    }

    if (item.items) {
      fixUpNavItems(item.items, baseUrl);
    }
  }
}

function fixUpNav(nav: any, baseUrl: string) {
  const services = nav.services;

  if (services && services.length > 0) {
    let foundSelectedService = false;

    for (const service of services) {
      if (service.items) {
        fixUpNavItems(service.items, baseUrl);
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
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private windowRef: SkyAppWindowRef,
    private config: SkyAppConfig,
    @Optional() private searchProvider?: SkyAppSearchResultsProvider
  ) { }

  public ngOnInit() {

    // Without this code, navigating to a new route doesn't cause the window to be
    // scrolled to the top like the browser does automatically with non-SPA navigation.
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.windowRef.nativeWindow.scroll(0, 0);
      }
    });

    this.initShellComponents();
  }

  // Only pass params that omnibar config cares about
  private setParamsFromQS(omnibarConfig: any) {
    this.config.runtime.params.getAllKeys().forEach(key => {
      omnibarConfig[key] = this.config.runtime.params.get(key);
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
      fixUpNav(nav, baseUrl);
    } else {
      nav = omnibarConfig.nav = new BBOmnibarNavigation();
    }

    nav.beforeNavCallback = (item: BBOmnibarNavigationItem) => {
      const url = item.url.toLowerCase();

      if (url.indexOf(baseUrl) === 0) {
        const routePath = url.substring(baseUrl.length, url.length);
        this.router.navigateByUrl(routePath);
        return false;
      }
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

        for (let route of globalRoutes) {
          localNavItems.push({
            title: route.name,
            url: baseUrl + route.route,
            data: route
          });
        }

        nav.localNavItems = localNavItems;
      }
    }
  }

  private initShellComponents() {
    const omnibarConfig = this.config.skyux.omnibar;

    if (omnibarConfig) {
      this.setParamsFromQS(omnibarConfig);
      this.setNav(omnibarConfig);
      this.setOnSearch(omnibarConfig);
      BBOmnibar.load(omnibarConfig);
    }

    if (this.config.skyux.help) {
      BBHelp.load(this.config.skyux.help);
    }
  }
}
