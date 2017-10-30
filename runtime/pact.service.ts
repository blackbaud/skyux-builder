import { SkyAppConfig } from 'runtime';

declare var Pact: any;

/**
 * Wrapper service for pact-js functions to handle finding the correct pact server
 */
export class SkyPactService {

  private pactProviders: { [providerName: string]: any } = {};
  constructor(private appConfig: SkyAppConfig) {
    Object.keys(this.appConfig.skyux.pactConfig.providers).forEach((providerName: string) => {

      this.pactProviders[providerName] =
        Pact(
          {
            host: this.appConfig.skyux.pactConfig.providers[providerName].host,
            port: this.appConfig.skyux.pactConfig.providers[providerName].port
          }
        );

    });
  }

  public addInteraction(provider: string, interaction: any) {

    return this.pactProviders[provider].addInteraction(interaction);

  }

  public removeInteractions(provider: string) {

    return this.pactProviders[provider].removeInteractions();

  }

  public finalize(provider: string) {

    return this.pactProviders[provider].finalize();

  }

  public verify(provider: string) {

    return this.pactProviders[provider].verify();

  }

}
