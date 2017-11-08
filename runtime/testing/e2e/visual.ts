import { element, by, browser } from 'protractor';
const pixDiff = require('pix-diff');

import { SkyHostBrowser } from './host-browser';

const CHECK_REGION_CONFIG = {
  thresholdType: pixDiff.THRESHOLD_PERCENT,
  threshold: .02
};

export interface SkyCompareScreenshotConfig {
  screenshotName: string;
  selector?: string;
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg';
}

export abstract class SkyVisualTest {
  public static compareScreenshot(config: SkyCompareScreenshotConfig): any {
    const selector = config.selector || 'body';
    const subject = element(by.css(selector));

    SkyVisualTest.resizeWindow(config.breakpoint);

    return browser
      .pixDiff
      .checkRegion(
        subject,
        config.screenshotName,
        CHECK_REGION_CONFIG
      )
      .then((results: any) => {
        const code = results.code;
        const isSimilar = (code === pixDiff.RESULT_SIMILAR || code === pixDiff.RESULT_IDENTICAL);
        const mismatchPercentage = (results.differences / results.dimension * 100).toFixed(2);
        const message = `Screenshots have mismatch of ${mismatchPercentage} percent!`;

        expect(isSimilar).toBe(true, message);
      });
  }

  public static scrollTo(selector: string): void {
    const elem = element(by.css(selector)).getWebElement();
    browser.executeScript('arguments[0].scrollIntoView();', elem);
  }

  public static moveCursorOffScreen(): void {
    browser
      .actions()
      .mouseMove(element(by.css('body')), { x: 0, y: 0 })
      .perform();
  }

  private static resizeWindow(breakpoint: string): void {
    let width: number;
    let height: number;

    switch (breakpoint) {
      case 'xs':
        width = 480;
        height = 800;
        break;
      case 'sm':
        width = 768;
        height = 800;
        break;
      default:
      case 'md':
        width = 992;
        height = 800;
        break;
      case 'lg':
        width = 1200;
        height = 800;
        break;
    }

    SkyHostBrowser.resizeWindow(width, height);
  }
}
