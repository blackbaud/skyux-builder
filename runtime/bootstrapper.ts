import {
  BBAuth,
  BBContextArgs,
  BBContextProvider
} from '@blackbaud/auth-client';

import { SkyuxConfig } from './config';

import { SkyAppRuntimeConfigParams } from '../runtime';

function addQSParam(url: string, name: string, value: string): string {
  const parts = url.split('#');

  if (parts[0].indexOf('?')) {
    parts[0] += '&';
  } else {
    parts[0] += '?';
  }

  parts[0] += `${name}=${encodeURIComponent(value)}`;

  return parts.join('#');
}

export class SkyAppBootstrapper {

  public static config: SkyuxConfig;

  public static processBootstrapConfig(): Promise<any> {
    if (SkyAppBootstrapper.config && SkyAppBootstrapper.config.auth) {
      return BBAuth.getToken()
        .then((token) => {
          const params = new SkyAppRuntimeConfigParams(
            window.location.toString(),
            this.config.params
          );

          const envId = params.get('envid');

          const promise = new Promise((resolve) => {
            BBContextProvider.ensureContext({
              envId: params.get('envid'),
              envIdRequired: params.isRequired('envid'),
              svcId: params.get('svcid'),
              svcIdRequired: params.isRequired('svcid'),
              url: window.location.href
            }).then((args: BBContextArgs) => {
              if (args.envId && !envId) {
                history.replaceState(
                  {},
                  '',
                  addQSParam(window.location.href, 'envid', args.envId)
                );
              }

              resolve(token);
            });
          });

          return promise;
        });
    } else {
      return Promise.resolve();
    }
  }
}
