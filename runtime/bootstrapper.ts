import { BBAuth } from '@blackbaud/auth-client';

import { SkyAppBootstrapConfig } from './bootstrap-config';

export class SkyAppBootstrapper {
  public static bootstrapConfig: SkyAppBootstrapConfig;

  public static processBootstrapConfig(): Promise<any> {
    if (SkyAppBootstrapper.bootstrapConfig) {
      let authPromise: Promise<any>;

      if (SkyAppBootstrapper.bootstrapConfig.auth) {
        authPromise = BBAuth.getToken();
      } else {
        authPromise = Promise.resolve();
      }

      return authPromise;
    }

    return Promise.resolve();
  }
}
