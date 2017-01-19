import { Injectable } from '@angular/core';

import { Headers, RequestOptions } from '@angular/http';

@Injectable()
export class SkyAppAuthenticationService {
  public createRequestOptions(tokenPromise: Promise<string>): Promise<RequestOptions> {
    return new Promise<RequestOptions>((resolve: any, reject: any) => {
      const headers = new Headers();

      this.appendAuthHeader(tokenPromise, headers)
        .then(() => {
          const options = new RequestOptions({
            headers: headers
          });

          resolve(options);
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  }

  public appendAuthHeader(tokenPromise: Promise<string>, headers: Headers): Promise<any> {
    return new Promise<any>((resolve: any, reject: any) => {
      tokenPromise
        .then((token: string) => {
          headers.append('Authorization', 'Bearer ' + token);

          resolve();
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  }
}
