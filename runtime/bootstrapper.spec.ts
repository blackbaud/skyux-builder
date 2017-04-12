import { SkyAppConfig } from './config';
import { SkyAppBootstrapper } from './bootstrapper';
import { BBAuth } from '@blackbaud/auth-client';

describe('bootstrapper', () => {

  beforeEach(() => {
    SkyAppConfig.skyux = {};
  });

  it('should immediately resolve if SkyAppConfig.skyux.auth is not set', (done) => {
    SkyAppBootstrapper.processBootstrapConfig().then(done);
  });

  it('should call if BBAuth.getToken if SkyAppConfig.skyux.auth is set', (done) => {
    const getTokenSpy = spyOn(BBAuth, 'getToken').and.returnValue(Promise.resolve());

    SkyAppConfig.skyux = {
      auth: true
    };

    SkyAppBootstrapper.processBootstrapConfig().then(() => {
      expect(getTokenSpy).toHaveBeenCalled();
      done();
    });
  });

});
