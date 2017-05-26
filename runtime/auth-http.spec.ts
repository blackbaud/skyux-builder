import { ReflectiveInjector } from '@angular/core';
import { BaseRequestOptions, ConnectionBackend, RequestOptions } from '@angular/http';
import { Response, ResponseOptions } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

import { BBAuth } from '@blackbaud/auth-client';
import { SkyAuthHttp } from './auth-http';

import { SkyAppConfig } from './config';
import { SkyAppRuntimeConfigParams } from './params';
import { SkyAuthTokenProvider } from './auth-token-provider';

describe('SkyAuthHttp', () => {

  let skyAuthHttp: SkyAuthHttp;
  let lastConnection: MockConnection;

  function setupInjector(url: string) {
    const injector = ReflectiveInjector.resolveAndCreate([
      SkyAuthTokenProvider,
      SkyAuthHttp,
      {
        provide: ConnectionBackend,
        useClass: MockBackend
      },
      {
        provide: RequestOptions,
        useClass: BaseRequestOptions
      },
      {
        provide: SkyAppConfig,
        useValue: {
          runtime: {
            params: new SkyAppRuntimeConfigParams(url, [
              'envid',
              'svcid'
            ])
          }
        }
      }
    ]);

    skyAuthHttp = injector.get(SkyAuthHttp);
    const backend = injector.get(ConnectionBackend) as MockBackend;

    backend.connections.subscribe((connection: MockConnection) => {
      lastConnection = connection;
      connection.mockRespond(new Response(new ResponseOptions({})));
    });
  }

  it('should call BBAuth.getToken and add token as header', (done) => {
    const token = 'my-fake-token';
    const getTokenSpy = spyOn(BBAuth, 'getToken').and.returnValue(Promise.resolve(token));

    setupInjector('');
    skyAuthHttp.get('my-bff-url.com').subscribe(() => {
      expect(lastConnection.request.headers.get('Authorization')).toEqual(`Bearer ${token}`);
      expect(getTokenSpy).toHaveBeenCalled();
      done();
    });
  });

  it('should include envid if it is in the current url', (done) => {
    const search = '?envid=1234';
    spyOn(BBAuth, 'getToken').and.returnValue(Promise.resolve());

    setupInjector(search);
    skyAuthHttp.get('example.com').subscribe(() => {
      expect(lastConnection.request.url).toContain(search);
      done();
    });
  });

  it('should include svc if it is in the current url', (done) => {
    const search = '?svcid=1234';
    spyOn(BBAuth, 'getToken').and.returnValue(Promise.resolve());

    setupInjector(search);
    skyAuthHttp.get('example.com').subscribe(() => {
      expect(lastConnection.request.url).toContain(search);
      done();
    });
  });

  it('should include envid and svcid if they are in the current url', (done) => {
    const search = '?envid=1234&svcid=5678';
    spyOn(BBAuth, 'getToken').and.returnValue(Promise.resolve());

    setupInjector(search);
    skyAuthHttp.get('example.com').subscribe(() => {
      expect(lastConnection.request.url).toContain(search);
      done();
    });
  });

  it('should not pass through unknown query params', (done) => {
    const search = '?junk=asdf';
    spyOn(BBAuth, 'getToken').and.returnValue(Promise.resolve());

    setupInjector(search);
    skyAuthHttp.get('example.com').subscribe(() => {
      expect(lastConnection.request.url).not.toContain(search);
      done();
    });
  });

  it('should handle a requested url with a querystring', (done) => {
    const url = 'example.com?custom=true';
    const search = 'envid=asdf';
    spyOn(BBAuth, 'getToken').and.returnValue(Promise.resolve());

    setupInjector('?' + search);
    skyAuthHttp.get(url).subscribe(() => {
      expect(lastConnection.request.url).toEqual(url + '&' + search);
      done();
    });
  });

  it('should handle being passed a url string (instead of Request)', (done) => {
    const url = 'url-as-string.com';
    spyOn(BBAuth, 'getToken').and.returnValue(Promise.resolve());

    setupInjector('');
    skyAuthHttp.request(url).subscribe(() => {
      expect(lastConnection.request.url).toEqual(url);
      done();
    });
  });

});
