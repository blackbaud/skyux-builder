import { browser } from 'protractor';

export class SkyHostBrowser {

  public static get(url: string, timeout?: number): any {

    const scripts = JSON.parse(browser.params.scripts);
    const skyPagesConfig = JSON.parse(browser.params.skyPagesConfig);
    const delimeter = url.indexOf('?') === -1 ? '?' : '&';

    // TO DO, FACTOR THIS OUT IN CONJUNCTION WITH SKYUX SERVE
    const cfg = new Buffer(JSON.stringify({
      scripts: scripts,
      localUrl: `https://localhost:${browser.params.port}`,
      externals: skyPagesConfig.app.externals || {}
    })).toString('base64');

    const destination = `${skyPagesConfig.host.url}${url}${delimeter}local=true&_cfg=${cfg}`;
    console.log(`Resolved request for ${url} into ${destination}`);

    return browser.get(destination, timeout);
  }

  public static getPageSource(): any {
    return browser.getPageSource();
  }

  // TO DO, Figure out elegant way to expose all browser methods here.
  // "extends browser" caused errors
}
