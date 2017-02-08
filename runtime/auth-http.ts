import { Injectable } from '@angular/core';

import {
  Headers,
  Http,
  Request,
  RequestOptions,
  RequestOptionsArgs,
  Response
} from '@angular/http';

import { Observable } from 'rxjs/Rx';

import { BBAuth } from '@blackbaud/auth-client';

@Injectable()
export class SkyAuthHttp extends Http {
  public request(
    url: string | Request,
    options?: RequestOptionsArgs
  ): Observable<Response> {
    return Observable.fromPromise(BBAuth.getToken())
      .flatMap((token: string) => {
        let authOptions: Request | RequestOptionsArgs;

        if (url instanceof Request) {
          // If the user calls get(), post(), or any of the other convenience
          // methods supplied by the Http base class, Angular will have converted
          // the url parameter to a Request object and the options parameter will
          // be undefined.
          authOptions = url;
        } else {
          // The url parameter can be a string in cases where reuqest() is called
          // directly by the consumer.  Handle that case by adding the header to the
          // options parameter.
          authOptions = options || new RequestOptions();
        }

        authOptions.headers = authOptions.headers || new Headers();

        authOptions.headers.set('Authorization', 'Bearer ' + token);

        return super.request(url, authOptions);
      });
  }
}
