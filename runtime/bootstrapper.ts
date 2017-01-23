import { BBAuth, BBOmnibar } from '@blackbaud/auth-client';

interface SkyAppBootstrapConfig {
  omnibar?: {
    serviceName?: string
  };

  auth?: boolean;
}

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
