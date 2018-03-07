import { Directive, Input } from '@angular/core';
import { PathLocationStrategy, PlatformLocation } from '@angular/common';
import { SkyAppWindowRef } from '../window-ref';
import { SkyAppConfig } from '../config';
import { ActivatedRoute, Router, RouterLinkWithHref } from '@angular/router';

@Directive({
  selector: '[skyAppLinkExternal]'
})
export class SkyAppLinkExternalDirective extends RouterLinkWithHref {

  @Input()
  set skyAppLinkExternal(commands: any[] | string) {
    this.routerLink = commands;
  }

  constructor(
    router: Router,
    route: ActivatedRoute,
    platformLocation: PlatformLocation,
    private skyAppConfig: SkyAppConfig,
    private window: SkyAppWindowRef
  ) {
    super(router, route, new PathLocationStrategy(platformLocation, skyAppConfig.skyux.host.url));
    this.queryParamsHandling = 'merge';
    this.queryParams = this.skyAppConfig.runtime.params.getAll();
    if (this.window.nativeWindow.window.name && this.window.nativeWindow.window.name !== '') {
      this.target = this.window.nativeWindow.window.name;
    } else {
      this.target = '_top';
    }
  }
}
