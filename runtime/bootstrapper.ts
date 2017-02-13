import { BBAuth, BBOmnibar } from '@blackbaud/auth-client';
import { BBHelp } from '@blackbaud/help-client';

import { SkyAppBootstrapConfig } from './bootstrap-config';

export class SkyAppBootstrapper {
  public static bootstrapConfig: SkyAppBootstrapConfig;

  public static processBootstrapConfig(): Promise<any> {
    if (SkyAppBootstrapper.bootstrapConfig) {
      let authPromise: Promise<any>;

      // BBHelp init
      if (SkyAppBootstrapper.bootstrapConfig.help) {
        BBHelp.load(SkyAppBootstrapper.bootstrapConfig.help);
      }

      // BBAuth init
      if (SkyAppBootstrapper.bootstrapConfig.auth) {
        authPromise = BBAuth.getToken();
      } else {
        authPromise = Promise.resolve();
      }

      // BBOmnibar init
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