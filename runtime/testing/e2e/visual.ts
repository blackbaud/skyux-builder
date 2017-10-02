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
        const mismatchPercentage = (results.differences / results.dimension * 100).toFixed(2);
        const message = `Screenshots have mismatch of ${mismatchPercentage} percent!`;

        expect(isSimilar).toBe(true, message);
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
