import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { BBOmnibar } from '@blackbaud/auth-client';
import { BBHelp } from '@blackbaud/help-client';

import { SKY_PAGES } from './sky-pages.module';

import { SkyAppBootstrapper } from '../../runtime/bootstrapper';

require('style!@blackbaud/skyux/dist/css/sky.css');
require('style!./app.component.scss');

// declare var SKY_PAGES: any;

@Component({
  selector: 'sky-pages-app',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  constructor(private router: Router) { }

  public ngOnInit() {
    console.log(SKY_PAGES);
    // Without this code, navigating to a new route doesn't cause the window to be
    // scrolled to the top like the browser does automatically with non-SPA navigation.
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        window.scroll(0, 0);
      }
    });

    let omnibarConfig = SkyAppBootstrapper.bootstrapConfig.omnibar;

    if (omnibarConfig) {
      const baseUrl =
        SKY_PAGES.host.url +
        SKY_PAGES.app.base.substr(0, SKY_PAGES.app.base.length - 1);

      const navItems = omnibarConfig.navItems;
      const nav = {
        localNavItems: undefined,
        beforeNavCallback: (item: any) => {
          if (item.url.indexOf(baseUrl) === 0) {
            let routePath = item.url.substring(baseUrl.length, item.url.length);
            this.router.navigateByUrl(routePath);
            return false;
          }
        }
      };

      if (SKY_PAGES.command !== 'serve') {
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

      BBOmnibar.load(omnibarConfig, nav);
    }

    if (SkyAppBootstrapper.bootstrapConfig.help) {
      BBHelp.load(SkyAppBootstrapper.bootstrapConfig.help);
    }
  }
}
