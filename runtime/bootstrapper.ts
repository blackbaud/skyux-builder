declare let BBAUTH: any;

interface SkyAppBootstrapConfig {
  omnibar?: {
    serviceName?: string
  };

  auth?: () => Promise<any>;
}

export class SkyAppBootstrapper {
  public static set beforeBootstrap(value: () => Promise<any>) {
    SkyAppBootstrapper._beforeBootstrap = value;
  }

  public static get beforeBootstrap(): () => Promise<any> {
    return SkyAppBootstrapper._beforeBootstrap || SkyAppBootstrapper.defaultBeforeBootstrap;
  }

  private static _beforeBootstrap: Promise<any>;

  private static defaultBeforeBootstrap = (): Promise<any> => {
      return new Promise<any>((resolve) => {
        resolve();
      });
    };
}
