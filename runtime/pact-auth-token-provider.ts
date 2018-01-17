import { BBAuthGetTokenArgs } from '@blackbaud/auth-client';

export class SkyPactAuthTokenProvider {

  public getToken(args?: BBAuthGetTokenArgs): Promise<string> {
    return Promise.resolve('mock_access_token_auth-client@blackbaud.com');
  }

}
