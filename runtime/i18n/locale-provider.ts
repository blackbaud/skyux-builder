import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';

/* istanbul ignore next */
@Injectable()
export abstract class SkyAppLocaleProvider {

  public abstract getLocaleInfo(): Observable<{locale: string}>;

}
