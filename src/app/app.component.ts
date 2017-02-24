import {
  Component,
  OnInit
} from '@angular/core';

import {
  NavigationEnd,
  Router
} from '@angular/router';

import {
  BBOmnibar,
  BBOmnibarConfig,
  BBOmnibarNavigation,
  BBOmnibarNavigationItem
} from '@blackbaud/auth-client';

import { BBHelp } from '@blackbaud/help-client';

import { SKY_PAGES } from './sky-pages.module';

require('style!@blackbaud/skyux/dist/css/sky.css');
require('style!./app.component.scss');

@Component({
  selector: 'sky-pages-app',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  constructor(private router: Router) { }

  public ngOnInit() {
    // Without this code, navigating to a new route doesn't cause the window to be
    // scrolled to the top like the browser does automatically with non-SPA navigation.
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        window.scroll(0, 0);
      }
    });

    this.initShellComponents();
  }

  private initShellComponents() {
    const bootstrapConfig = SKY_PAGES.bootstrapConfig;

    if (bootstrapConfig) {
      const omnibarBootstrapConfig = bootstrapConfig.omnibar;

      if (omnibarBootstrapConfig) {
        const omnibarConfig: BBOmnibarConfig = {
          serviceName: omnibarBootstrapConfig.serviceName,
          experimental: omnibarBootstrapConfig.experimental
        };

        const baseUrl =
          (
            SKY_PAGES.host.url +
            SKY_PAGES.app.base.substr(0, SKY_PAGES.app.base.length - 1)
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

        if (SKY_PAGES.command === 'serve') {
          // Add any global routes to the omnibar as a convenience to the developer.
          const globalRoutes =
            SKY_PAGES.publicRoutes &&
            SKY_PAGES.publicRoutes.filter((value: any) => {
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

        BBOmnibar.load(omnibarConfig);
      }

      if (bootstrapConfig.help) {
        BBHelp.load(bootstrapConfig.help);
      }
    }
  }
}
