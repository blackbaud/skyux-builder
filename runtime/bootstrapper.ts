import { BBAuth } from '@blackbaud/auth-client';

import { SkyuxConfig } from './config';

export class SkyAppBootstrapper {

  public static config: SkyuxConfig;

  public static processBootstrapConfig(): Promise<any> {
    if (SkyAppBootstrapper.config && SkyAppBootstrapper.config.auth) {
      return BBAuth.getToken();
    } else {
      return Promise.resolve();
    }
  }
}
