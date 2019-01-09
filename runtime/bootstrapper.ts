//#region imports
import {
  BBAuth,
  BBContextArgs,
  BBContextProvider
} from '@blackbaud/auth-client';

import {
  SkyAppRuntimeConfigParams,
  SkyuxConfig
} from '@skyux/config';
//#endregion

export class SkyAppBootstrapper {

  public static config: SkyuxConfig;

  public static processBootstrapConfig(): Promise<any> {
    if (SkyAppBootstrapper.config && SkyAppBootstrapper.config.auth) {
      return BBAuth.getToken()
        .then(() => {
          const currentUrl = this.getUrl();

          const params = new SkyAppRuntimeConfigParams(
            currentUrl,
            this.config.params!
          );

          const ensureContextArgs: BBContextArgs = {
            envId: params.get('envid'),
            envIdRequired: params.isRequired('envid'),
            leId: params.get('leid'),
            leIdRequired: params.isRequired('leid'),
            svcId: params.get('svcid'),
            svcIdRequired: params.isRequired('svcid'),
            url: currentUrl
          };

          return BBContextProvider.ensureContext(ensureContextArgs)
            .then((args) => {
              // The URL will remain the same if the required context is already present, in which
              // case there's no need to update the URL.
              if (args.url !== currentUrl) {
                history.replaceState(
                  {},
                  '',
                  args.url
                );
              }
            });
        });
    } else {
      return Promise.resolve();
    }
  }

  private static getUrl(): string {
    return window.location.href;
  }
}
