import {
  Injectable
} from '@angular/core';

import {
  ConnectionBackend,
  Headers,
  Http,
  Request,
  RequestOptions,
  RequestOptionsArgs
} from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/mergeMap';

import { SkyAppConfig } from '@blackbaud/skyux-builder/runtime/config';
import { SkyAuthTokenProvider } from '@blackbaud/skyux-builder/runtime/auth-token-provider';

@Injectable()
export class SkyAuthHttp extends Http {

  constructor(
    backend: ConnectionBackend,
    defaultOptions: RequestOptions,
    private authTokenProvider: SkyAuthTokenProvider,
    private skyAppConfig: SkyAppConfig
  ) {
    super(backend, defaultOptions);
  }

  public request(
    url: string | Request,
    options?: RequestOptionsArgs
  ): Observable<any> {
    return Observable.fromPromise(this.authTokenProvider.getToken())
      .flatMap((token: string) => {
        let authOptions: Request | RequestOptionsArgs;

        if (url instanceof Request) {
          // If the user calls get(), post(), or any of the other convenience
          // methods supplied by the Http base class, Angular will have converted
          // the url parameter to a Request object and the options parameter will
          // be undefined.
          authOptions = url;
          url.url = this.skyAppConfig.runtime.params.getUrl(url.url);
        } else {
          // The url parameter can be a string in cases where reuqest() is called
          // directly by the consumer.  Handle that case by adding the header to the
          // options parameter.
          authOptions = options || new RequestOptions();
          url = this.skyAppConfig.runtime.params.getUrl(url);
        }

        authOptions.headers = authOptions.headers || new Headers();

        authOptions.headers.set('Authorization', 'Bearer ' + token);

        return super.request(url, authOptions);
      });
  }
}
