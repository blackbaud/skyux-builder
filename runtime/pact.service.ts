import { SkyAppConfig } from '@blackbaud/skyux-builder/runtime/config';

declare var Pact: any;

/**
 * Wrapper service for pact-js functions to handle finding the correct pact server
 */
export class SkyPactService {

  private pactProviders: { [providerName: string]: any } = {};

  private matchersInternal: any;

  constructor(private appConfig: SkyAppConfig) {
    Object.keys(this.appConfig.runtime.pactConfig.providers).forEach((providerName: string) => {

      this.pactProviders[providerName] =
        new Pact.PactWeb(
          {
            host: this.appConfig.runtime.pactConfig.providers[providerName].host,
            port: this.appConfig.runtime.pactConfig.providers[providerName].port
          }
        );

    });

    this.matchersInternal = Pact.Matchers;
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

  public get matchers() {
    return this.matchersInternal;
  }

}
