import { SkyAppConfig } from './config';

describe('SkyAppConfig', () => {

  it('should define a static runtime property', () => {
    expect(SkyAppConfig.runtime).toBeDefined();
  });

  it('should define a static skyux property', () => {
    expect(SkyAppConfig.skyux).toBeDefined();
  });

});
