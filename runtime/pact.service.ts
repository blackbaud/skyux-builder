import { PactWeb } from '@pact-foundation/pact-web';
import { SkyAppConfig } from '@blackbaud/skyux-builder/runtime/config';

declare var Pact: any;

/**
 * Wrapper service for pact-js functions to handle finding the correct pact server
 */
export class SkyPactService {

  private pactProviders: { [providerName: string]: PactWeb } = {};

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

  /**
   * Add an interaction to the Mock Service.
   * @param provider The name of the provider service.
   * @param interaction The provider interaction.
   */
  public addInteraction(provider: string, interaction: any): Promise<string> {
    return this.pactProviders[provider].addInteraction(interaction);
  }

  /**
   * Clear up any interactions in the Mock Service.
   * @param provider The name of the provider service.
   */
  public removeInteractions(provider: string): Promise<string> {
    return this.pactProviders[provider].removeInteractions();
  }

  /**
   * Writes the Pact file and clears any interactions left behind.
   * @param provider The name of the provider service.
   */
  public finalize(provider: string): Promise<string> {
    return this.pactProviders[provider].finalize();
  }

  /**
   * Checks with the Mock Service if the expected interactions have been exercised.
   * @param provider The name of the provider service.
   */
  public verify(provider: string): Promise<string> {
    return this.pactProviders[provider].verify();
  }

  public get matchers() {
    return this.matchersInternal;
  }

}
