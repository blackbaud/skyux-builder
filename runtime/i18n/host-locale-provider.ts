import {
  Injectable
} from '@angular/core';

import {
  SkyAppWindowRef
} from '../window-ref';

import {
  Observable
} from 'rxjs/Observable';

import {
  SkyAppLocaleInfo
} from './locale-info';

import {
  SkyAppLocaleProvider
} from './locale-provider';

@Injectable()
export class SkyAppHostLocaleProvider extends SkyAppLocaleProvider {
  constructor(
    private windowRef: SkyAppWindowRef
  ) {
    super();
  }

  public getLocaleInfo(): Observable<SkyAppLocaleInfo> {
    let locale: string | undefined;

    const skyuxHost = (this.windowRef.nativeWindow as any).SKYUX_HOST;

    if (skyuxHost) {
      const acceptLanguage = skyuxHost.acceptLanguage || '';
      locale = acceptLanguage.split(',')[0];
    }

    locale = locale || this.defaultLocale;

    return Observable.of({
      locale: locale
    });
  }
}
