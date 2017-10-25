import { SkyAppConfig } from 'runtime';

declare var Pact: any;

export class SkyPactService {

  private pactProviders: { [providerName: string]: any } = {};
  constructor(private appConfig: SkyAppConfig) {
  }

  public setup() {
    Object.keys(this.appConfig.skyux.pactServers).forEach((providerName: string) => {
      this.pactProviders[providerName] =
        Pact({ host: this.appConfig.skyux.pactServers[providerName].host, port: this.appConfig.skyux.pactServers[providerName].port });

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

  public verify(provider: string, interaction: any) {

    return this.pactProviders[provider].verify();

  }

}
