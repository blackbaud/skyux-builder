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

    // Filter params through paramsAllowed
    this.config.runtime.params.parse(this.windowRef.nativeWindow.location);

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
  private setParamsFromQS(omnibarConfig: BBOmnibarConfig) {
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
    const baseUrl =
      (
        this.config.skyux.host.url +
        this.config.runtime.app.base.substr(0, this.config.runtime.app.base.length - 1)
      ).toLowerCase();

    const nav = new BBOmnibarNavigation();

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
        this.config.skyux.publicRoutes &&
        this.config.skyux.publicRoutes.filter((value: any) => {
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

    omnibarConfig.nav = nav;
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
