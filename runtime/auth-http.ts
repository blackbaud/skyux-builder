import {
  Injectable,
  Optional
} from '@angular/core';

import {
  ConnectionBackend,
  Headers,
  Http,
  Request,
  RequestOptions,
  RequestOptionsArgs,
  Response,
  URLSearchParams
} from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/mergeMap';

import { SkyAppWindowRef } from '@blackbaud/skyux-builder/runtime/window-ref';

import { SkyAuthTokenProvider } from '@blackbaud/skyux-builder/runtime/auth-token-provider';

@Injectable()
export class SkyAuthHttp extends Http {

  constructor(
    backend: ConnectionBackend,
    defaultOptions: RequestOptions,
    private windowRef: SkyAppWindowRef,
    private authTokenProvider: SkyAuthTokenProvider
  ) {
    super(backend, defaultOptions);
  }

  public request(
    url: string | Request,
    options?: RequestOptionsArgs
  ): Observable<Response> {
    return Observable.fromPromise(this.authTokenProvider.getToken())
      .flatMap((token: string) => {
        let authOptions: Request | RequestOptionsArgs;

        if (url instanceof Request) {
          // If the user calls get(), post(), or any of the other convenience
          // methods supplied by the Http base class, Angular will have converted
          // the url parameter to a Request object and the options parameter will
          // be undefined.
          authOptions = url;
          url.url = this.addAllowedQueryString(url.url);
        } else {
          // The url parameter can be a string in cases where reuqest() is called
          // directly by the consumer.  Handle that case by adding the header to the
          // options parameter.
          authOptions = options || new RequestOptions();
          url = this.addAllowedQueryString(url);
        }

        authOptions.headers = authOptions.headers || new Headers();

        authOptions.headers.set('Authorization', 'Bearer ' + token);

        return super.request(url, authOptions);
      });
  }

  private addAllowedQueryString (url: string) {
    const urlSearchParams = new URLSearchParams(
      this.windowRef.nativeWindow.location.search.substr(1)
    );

    const allowed = [
      'envid',
      'svcid'
    ];

    let found: string[] = [];
    allowed.forEach(key => {
      const param = urlSearchParams.get(key);
      if (param) {
        found.push(`${key}=${param}`);
      }
    });

    if (found.length) {
      const delimeter = url.indexOf('?') === -1 ? '?' : '&';
      url = `${url}${delimeter}${found.join('&')}`;
    }

    return url;
  }
}
