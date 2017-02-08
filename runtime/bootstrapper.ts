import { BBAuth, BBOmnibar } from '@blackbaud/auth-client';
import { BBHelp } from '@blackbaud/help-client';

import { SkyAppBootstrapConfig } from './bootstrap-config';

export class SkyAppBootstrapper {
  public static bootstrapConfig: SkyAppBootstrapConfig;

  public static processBootstrapConfig(): Promise<any> {
    let promises: Promise<any>[] = [];

    if (SkyAppBootstrapper.bootstrapConfig) {

      // BBAuth init
      if (SkyAppBootstrapper.bootstrapConfig.auth) {
        promises.push(BBAuth.getToken());
      }

      // BBOmnibar init
      if (SkyAppBootstrapper.bootstrapConfig.omnibar) {
        promises.push(BBOmnibar.load(SkyAppBootstrapper.bootstrapConfig.omnibar));
      }

      // BBHelp init
      if (SkyAppBootstrapper.bootstrapConfig.help) {
        promises.push(BBHelp.load(SkyAppBootstrapper.bootstrapConfig.help));
      }
    }

    return Promise.all(promises);
  }
}