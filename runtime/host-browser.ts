import { browser } from 'protractor';

@Injectable()
export class SkyHostBrowser extends browser {
  public get(url: string, timeout?: number): any {

    const delimeter = destination.indexOf('?') === -1 ? '?' : '&';
    const cfg = new Buffer(JSON.stringify({
      scripts: [],
      localUrl: '',
      externals: {}
    })).toString('base64');

    return super.get(`${url}${delimeter}local=true&_cfg=${cfg}`, timeout);
  }
}
