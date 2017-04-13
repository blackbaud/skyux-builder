import { SkyAppBootstrapper } from './bootstrapper';
import { BBAuth } from '@blackbaud/auth-client';

describe('bootstrapper', () => {

  it('should immediately resolve if SkyAppConfig.config.skyux.auth is not set', (done) => {
    SkyAppBootstrapper.config = {};
    SkyAppBootstrapper.processBootstrapConfig().then(done);
  });

  it('should call if BBAuth.getToken if SkyAppConfig.config.skyux.auth is set', (done) => {
    const getTokenSpy = spyOn(BBAuth, 'getToken').and.returnValue(Promise.resolve());

    SkyAppBootstrapper.config = {
      auth: true
    };

    SkyAppBootstrapper.processBootstrapConfig().then(() => {
      expect(getTokenSpy).toHaveBeenCalled();
      done();
    });
  });

});
