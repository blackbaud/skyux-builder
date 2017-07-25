import { BBAuth, BBAuthGetTokenArgs } from '@blackbaud/auth-client';

export class SkyAuthTokenProvider {

  public getToken(args?: BBAuthGetTokenArgs): Promise<string> {
    return BBAuth.getToken(args);
  }

}
