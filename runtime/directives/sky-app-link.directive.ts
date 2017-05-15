import { Directive, Input, OnInit } from '@angular/core';
import { LocationStrategy } from '@angular/common';
import { ActivatedRoute, Router, RouterLinkWithHref } from '@angular/router';
import { SkyAppConfig } from '../config';

@Directive({
  selector: '[skyAppLink]'
})
export class SkyAppLinkDirective extends RouterLinkWithHref implements OnInit {

  private activatedRoute: ActivatedRoute;
  private skyAppConfig: SkyAppConfig;

  @Input()
  set skyAppLink(commands: any[]|string) {
    this.routerLink = commands;
  }

  public ngOnInit() {
    console.log(this.skyAppConfig.runtime.params);
    this.queryParams = this.skyAppConfig.runtime.params.getAll();
  }

  constructor(
    router: Router,
    route: ActivatedRoute,
    locationStrategy: LocationStrategy,
    skyAppConfig: SkyAppConfig
  ) {
    super(router, route, locationStrategy);
    this.activatedRoute = route;
  }
}
