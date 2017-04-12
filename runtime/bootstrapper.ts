import { BBAuth } from '@blackbaud/auth-client';

import { SkyAppConfig } from './config';

export class SkyAppBootstrapper {
  public static processBootstrapConfig(): Promise<any> {
    return SkyAppConfig.skyux.auth ? BBAuth.getToken() : Promise.resolve();
  }
}
