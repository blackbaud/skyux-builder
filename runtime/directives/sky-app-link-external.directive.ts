import { Directive, Input, HostListener, OnInit } from '@angular/core';
import { SkyAppWindowRef } from '../window-ref';
import { SkyAppConfig } from '@blackbaud/skyux-builder/runtime';
import { HttpParams } from '@angular/common/http';

@Directive({
  selector: '[skyAppLinkExternal]'
})
export class SkyAppLinkExternalDirective implements OnInit {
  @Input() private skyAppLinkExternal: string;
  private externalSPAUrl: string;

  constructor(
    private skyAppConfig: SkyAppConfig,
    private window: SkyAppWindowRef
  ) { }

  public ngOnInit() {
    const queryParams: any = this.skyAppConfig.runtime.params.getAll();
    const urlParts = this.skyAppLinkExternal.split('?');

    let params = new HttpParams({ fromString: urlParts[1] });
    for (const key in queryParams) {
      if (queryParams.hasOwnProperty(key)) {
        params = params.append(key, queryParams[key]);
      }
    }

    this.externalSPAUrl = `${this.skyAppConfig.skyux.host.url}${urlParts[0]}?${params.toString()}`;
  }

  @HostListener('click', ['$event'])
  public onClick(event: MouseEvent) {
    this.window.nativeWindow.location.href = this.externalSPAUrl;
  }
}
