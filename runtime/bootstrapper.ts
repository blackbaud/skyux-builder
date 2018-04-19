import {
  BBAuth,
  BBContextProvider
} from '@blackbaud/auth-client';

import { SkyuxConfig } from './config';

import { SkyAppRuntimeConfigParams } from './params';

function addQSParam(url: string, name: string, value: string): string {
  const urlAndFragment = url.split('#');

  urlAndFragment[0] += urlAndFragment[0].indexOf('?') >= 0 ? '&' : '?';
  urlAndFragment[0] += `${name}=${encodeURIComponent(value)}`;

  return urlAndFragment.join('#');
}

export class SkyAppBootstrapper {

  public static config: SkyuxConfig;

  public static processBootstrapConfig(): Promise<any> {
    if (SkyAppBootstrapper.config && SkyAppBootstrapper.config.auth) {
      return BBAuth.getToken()
        .then((token) => {
          const url = this.getUrl();

          const params = new SkyAppRuntimeConfigParams(
            url,
            this.config.params
          );

          const currentEnvId = params.get('envid');

          return BBContextProvider.ensureContext({
            envId: currentEnvId,
            envIdRequired: params.isRequired('envid'),
            svcId: params.get('svcid'),
            svcIdRequired: params.isRequired('svcid'),
            url: url
          }).then(({ envId }) => {
            // The context provider was able to provide an environment ID when none
            // was supplied to the app; add it to the URL's query string and continue
            // loading the app.  Downstream constructors of SkyAppRuntimeConfigParams
            // will then pick up the environment ID from the query string.
            if (!currentEnvId && envId) {
              history.replaceState(
                {},
                '',
                addQSParam(url, 'envid', envId)
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
