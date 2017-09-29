import { element, by, browser } from 'protractor';
const pixDiff = require('pix-diff');

import { SkyHostBrowser } from './host-browser';

export interface SkyCompareScreenshotConfig {
  screenshotName: string;
  selector: string;
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg';
}

export abstract class SkyVisualTest {
  public static readonly THRESHOLD_PERCENT = .02;

  public static compareScreenshot(config: SkyCompareScreenshotConfig): any {
    // Needed?
    // browser.sleep(1000);

    const subject = element(by.css(config.selector));
    const checkRegionConfig = {
      thresholdType: pixDiff.THRESHOLD_PERCENT,
      threshold: SkyVisualTest.THRESHOLD_PERCENT
    };

    SkyVisualTest.resizeWindow(config.breakpoint);

    return browser.pixDiff
      .checkRegion(
        subject,
        config.screenshotName,
        checkRegionConfig
      )
      .then((results: any) => {
        const code = results.code;
        const isSimilar = (code === pixDiff.RESULT_SIMILAR || code === pixDiff.RESULT_IDENTICAL);

        if (isSimilar) {
          return Promise.resolve();
        }

        return SkyVisualTest.generateDiffScreenshot(config, results);
      })
      .then((mismatchMessage: string) => {
        expect(true).toBe(false, mismatchMessage);
      })
      .catch((error: any) => {
        if (error.message.indexOf('saving current image') === -1) {
          throw error;
        }

        return Promise.resolve();
      });
  }

  private static generateDiffScreenshot(
    config: SkyCompareScreenshotConfig,
    results: any
  ): Promise<any> {
    const comparator = new pixDiff(browser.skyVisualTestConfig.created);
    const subject = element(by.css(config.selector));

    return comparator
      .saveRegion(subject, config.screenshotName)
      .then(() => {
        const mismatchPercentage = (results.differences / results.dimension * 100).toFixed(2);
        return `Screenshots have mismatch percentage of ${mismatchPercentage} percent!`;
      });
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
        width = 920;
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
