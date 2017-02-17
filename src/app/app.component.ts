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

import { SkyAppBootstrapper } from '../../runtime/bootstrapper';

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
    let omnibarConfig = <BBOmnibarConfig>SkyAppBootstrapper.bootstrapConfig.omnibar;

    if (omnibarConfig) {
      const baseUrl =
        (
          SKY_PAGES.host.url +
          SKY_PAGES.app.base.substr(0, SKY_PAGES.app.base.length - 1)
        ).toLowerCase();

      const navItems = omnibarConfig.navItems;

      const nav = new BBOmnibarNavigation();

      nav.beforeNavCallback = (item: BBOmnibarNavigationItem) => {
        const url = item.url.toLowerCase();

        if (url.indexOf(baseUrl) === 0) {
          let routePath = url.substring(baseUrl.length, url.length);
          this.router.navigateByUrl(routePath);
          return false;
        }
      };

      if (SKY_PAGES.command === 'serve') {
        if (navItems) {
          const localNavItems = [];

          for (let navItem of navItems) {
            localNavItems.push({
              title: navItem.name,
              url: baseUrl + navItem.route,
              data: navItem
            });
          }

          nav.localNavItems = localNavItems;
        }
      }

      omnibarConfig.nav = nav;

      BBOmnibar.load(omnibarConfig);
    }

    if (SkyAppBootstrapper.bootstrapConfig.help) {
      BBHelp.load(SkyAppBootstrapper.bootstrapConfig.help);
    }
  }
}
