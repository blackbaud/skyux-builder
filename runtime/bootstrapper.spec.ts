import { SkyAppBootstrapper } from './bootstrapper';

import {
  BBAuth,
  BBContextProvider
} from '@blackbaud/auth-client';

describe('bootstrapper', () => {

  let getTokenSpy: jasmine.Spy;
  let ensureContext: jasmine.Spy;
  let historyReplaceStateSpy: jasmine.Spy;
  let getUrlSpy: jasmine.Spy;

  function validateContextProvided(
    testEnvId: string,
    testUrl: string,
    expectedUrl: string
  ): Promise<any> {
    let contextPromiseResolve: any;

    const contextPromise = new Promise((resolve, reject) => {
      contextPromiseResolve = resolve;
    });

    return new Promise((resolve) => {
      getTokenSpy.and.returnValue(Promise.resolve());
      historyReplaceStateSpy.and.stub();

      getUrlSpy.and.returnValue(testUrl);

      ensureContext.and.returnValue(contextPromise);

      SkyAppBootstrapper.config = {
        auth: true,
        params: []
      };

      SkyAppBootstrapper.processBootstrapConfig().then(() => {
        expect(historyReplaceStateSpy).toHaveBeenCalledWith(
          {},
          '',
          expectedUrl
        );

        resolve();
      });

      contextPromiseResolve({
        envId: testEnvId,
        svcId: 'abc'
      });
    });
  }

  beforeEach(() => {
    getTokenSpy = spyOn(BBAuth, 'getToken');
    ensureContext = spyOn(BBContextProvider,  'ensureContext');
    historyReplaceStateSpy = spyOn(history, 'replaceState').and.callThrough();
    getUrlSpy = spyOn(SkyAppBootstrapper as any, 'getUrl').and.callThrough();
  });

  afterEach(() => {
    getTokenSpy.and.stub();
    ensureContext.and.stub();
    historyReplaceStateSpy.and.callThrough();
    getUrlSpy.and.callThrough();
  });

  it('should immediately resolve if SkyAppConfig.config.skyux.auth is not set', (done) => {
    SkyAppBootstrapper.config = {
      params: []
    };

    SkyAppBootstrapper.processBootstrapConfig().then(done);
  });

  it('should call if BBAuth.getToken if SkyAppConfig.config.skyux.auth is set', (done) => {
    getTokenSpy.and.returnValue(Promise.resolve());
    ensureContext.and.returnValue(Promise.resolve({}));

    SkyAppBootstrapper.config = {
      auth: true,
      params: []
    };

    SkyAppBootstrapper.processBootstrapConfig().then(() => {
      expect(getTokenSpy).toHaveBeenCalled();
      done();
    });
  });

  it('should wait for context from BBContextProvider to provide the required context', (done) => {
    validateContextProvided(
      '123',
      'https://example.com',
      'https://example.com?envid=123'
    )
      .then(() => validateContextProvided(
        '12&3',
        'https://example.com#test',
        'https://example.com?envid=12%263#test'
      ))
      .then(() => validateContextProvided(
        '123',
        'https://example.com?svcid=abc',
        'https://example.com?svcid=abc&envid=123'
      ))
      .then(done);
  });

});
