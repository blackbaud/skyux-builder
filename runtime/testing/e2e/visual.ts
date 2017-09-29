import { element, by, browser } from 'protractor';
import * as pixDiff from 'pix-diff';

import { SkyHostBrowser } from './host-browser';

export interface SkyCompareScreenshotConfig {
  screenshotName: string;
  selector: string;
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
      .then(() => {
        SkyHostBrowser.resizeWindow(
          browser.skyVisualTestConfig.baseline.width,
          browser.skyVisualTestConfig.baseline.height
        );
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
        const mismatchMessage
          = `Screenshots have mismatch percentage of ${mismatchPercentage} percent!`;
        return Promise.reject(new Error(mismatchMessage));
      });
  }
}
