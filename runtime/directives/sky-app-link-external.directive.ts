import { Directive, Input, HostListener } from "@angular/core";
import { SkyAppWindowRef } from "../window-ref";
import { SkyAppConfig } from "../config";
import { HttpParams } from '@angular/common/http';

@Directive({
  selector: "[skyAppLinkExternal]"
})
export class SkyAppLinkExternalDirective {
  @Input() skyAppLinkExternal: string;

  constructor(
    private skyAppConfig: SkyAppConfig,
    private window: SkyAppWindowRef
  ) { }

  @HostListener("click", ["$event"])
  public onClick(event: MouseEvent) {
    const queryParams: any = this.skyAppConfig.runtime.params.getAll();
    const urlParts = this.skyAppLinkExternal.split('?');

    let params = new HttpParams({ fromString: urlParts[1] })
    for (const key in queryParams) {
      if (queryParams.hasOwnProperty(key)) {
        params = params.append(key, queryParams[key]);
      }
    }

    this.window.nativeWindow.location.href = `${this.skyAppConfig.skyux.host.url}${urlParts[0]}?${params.toString()}`;
  }
}
