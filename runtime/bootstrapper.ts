import { BBAuth, BBOmnibar } from '@blackbaud/auth-client';

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

      if (SkyAppBootstrapper.bootstrapConfig.omnibar) {
        return authPromise.then(() => {
          BBOmnibar.load(SkyAppBootstrapper.bootstrapConfig.omnibar);
        });
      } else {
        return authPromise;
      }
    }

    return Promise.resolve();
  }
}
