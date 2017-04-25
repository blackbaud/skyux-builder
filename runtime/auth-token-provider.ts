import { BBAuth } from '@blackbaud/auth-client';

export class SkyAuthTokenProvider {

  public getToken(): Promise<string> {
    return BBAuth.getToken();
  }

}
