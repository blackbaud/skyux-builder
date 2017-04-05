import { SkyAppBootstrapper } from './bootstrapper';
import { BBAuth } from '@blackbaud/auth-client';

describe('bootstrapper', () => {

  beforeEach(() => {
    SkyAppBootstrapper.bootstrapConfig = undefined;
  });

  it('should immediately resolve if bootstrapConfig is not set', (done) => {
    expect(SkyAppBootstrapper.processBootstrapConfig).toBeDefined();
    SkyAppBootstrapper.processBootstrapConfig().then(done);
  });

  it('should immediately resolve if bootstrapConfig.auth is not set', (done) => {
    SkyAppBootstrapper.bootstrapConfig = {};
    SkyAppBootstrapper.processBootstrapConfig().then(done);
  });

  it('should call if BBAuth.getToken if bootstrapConfig.auth is set', (done) => {
    const getTokenSpy = spyOn(BBAuth, 'getToken').and.returnValue(Promise.resolve());

    SkyAppBootstrapper.bootstrapConfig = {
      auth: true
    };

    SkyAppBootstrapper.processBootstrapConfig().then(() => {
      expect(getTokenSpy).toHaveBeenCalled();
      done();
    });
  });

});
