import { browser } from 'protractor';
const hostUtils = require('../../../utils/host-utils');

// TODO: May be nice to expose all browser's methods through SkyHostBrowser
// Using "extend browser" didn't work for me.
export class SkyHostBrowser {

  public static get(url: string, timeout?: number): any {

    const destination = hostUtils.resolve(
      url,
      browser.params.localUrl,
      browser.params.chunks,
      browser.params.skyPagesConfig
    );

    return browser.get(destination, timeout);
  }

  public static resizeWindow(width: number, height: number) {
    browser.driver.manage().window().setSize(width, height);
  }
}
