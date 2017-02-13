import { BBAuth, BBOmnibar } from '@blackbaud/auth-client';
import { BBHelp } from '@blackbaud/help-client';

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

      return authPromise.then(() => {
        if (SkyAppBootstrapper.bootstrapConfig.omnibar) {
          BBOmnibar.load(SkyAppBootstrapper.bootstrapConfig.omnibar);
        }

        if (SkyAppBootstrapper.bootstrapConfig.help) {
          BBHelp.load(SkyAppBootstrapper.bootstrapConfig.help);
        }
      });
    }
  }
}
