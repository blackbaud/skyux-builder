import {
  Injectable
} from '@angular/core';

import {
  SkyAppWindowRef
} from '../window-ref';

import {
  Observable
} from 'rxjs/Observable';

import 'rxjs/add/observable/of';

import {
  SkyAppLocaleInfo
} from './locale-info';

import {
  SkyAppLocaleProvider
} from './locale-provider';

@Injectable()
export class SkyAppHostLocaleProvider extends SkyAppLocaleProvider {
  public get currentLocale(): string {
    let locale: string | undefined;

    const skyuxHost = (this.windowRef.nativeWindow as any).SKYUX_HOST;

    if (skyuxHost) {
      const acceptLanguage = skyuxHost.acceptLanguage || '';
      locale = acceptLanguage.split(',')[0];
    }

    locale = locale || this.defaultLocale;

    return locale;
  }

  constructor(
    private windowRef: SkyAppWindowRef
  ) {
    super();
  }

  public getLocaleInfo(): Observable<SkyAppLocaleInfo> {
    const localeInfo: SkyAppLocaleInfo = {
      locale: this.currentLocale
    };

    return Observable.of(localeInfo);
  }
}
