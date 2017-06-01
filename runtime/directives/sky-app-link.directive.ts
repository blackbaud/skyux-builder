import { Directive, Input } from '@angular/core';
import { LocationStrategy } from '@angular/common';
import { ActivatedRoute, Router, RouterLinkWithHref } from '@angular/router';
import { SkyAppConfig } from '../config';

@Directive({
  selector: '[skyAppLink]'
})
export class SkyAppLinkDirective extends RouterLinkWithHref {

  @Input()
  set skyAppLink(commands: any[]|string) {
    this.routerLink = commands;
  }

  constructor(
    router: Router,
    route: ActivatedRoute,
    locationStrategy: LocationStrategy,
    private skyAppConfig: SkyAppConfig
  ) {
    super(router, route, locationStrategy);
    this.queryParams = skyAppConfig.runtime.params.getAll();
  }
}
