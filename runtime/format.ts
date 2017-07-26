import { Injectable } from '@angular/core';

@Injectable()
export class SkyAppFormat {

  public formatText(format: string, ...args: any[]) {
    return String(format).replace(/\{(\d+)\}/g, (match, capture) => {
      return args[parseInt(capture, 10)];
    });
  }

}
