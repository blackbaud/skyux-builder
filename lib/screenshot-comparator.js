/*jshint node: true, jasmine: true, browser: true */
'use strict';

const { browser, by, element } = require('protractor');
const PixDiff = require('pix-diff');
const SkyHostBrowser = require('./host-browser');

const CHECK_REGION_CONFIG = {
  thresholdType: PixDiff.THRESHOLD_PERCENT,
  threshold: 0.02
};

const compareScreenshot = function (config) {
  const selector = config.selector || 'body';
  const subject = element(by.css(selector));

  resizeWindow(config.breakpoint);

  return browser
    .pixDiff
    .checkRegion(
      subject,
      config.screenshotName,
      CHECK_REGION_CONFIG
    )
    .then((results) => {
      const code = results.code;
      const isSimilar = (
        code === PixDiff.RESULT_SIMILAR ||
        code === PixDiff.RESULT_IDENTICAL
      );
      const mismatchPercentage = (results.differences / results.dimension * 100).toFixed(2);
      const message = `Screenshots have mismatch of ${mismatchPercentage} percent!`;

      expect(isSimilar).toBe(true, message);
    })
    .catch((error) => {
      // Ignore 'baseline image not found' errors from PixDiff.
      if (error.message.indexOf('saving current image') > -1) {
        console.log(`[${config.screenshotName}]`, error.message);
        return Promise.resolve();
      }

      throw error;
    });
};

const moveCursorOffScreen = function () {
  const moveToElement = element(by.css('body'));
  browser.actions().mouseMove(moveToElement, { x: 0, y: 0 }).perform();
};

const resizeWindow = function (breakpoint) {
  let width;
  let height;

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
};

function ScreenshotComparator() { }

ScreenshotComparator.compareScreenshot = compareScreenshot;
ScreenshotComparator.moveCursorOffScreen = moveCursorOffScreen;
ScreenshotComparator.resizeWindow = resizeWindow;

ScreenshotComparator.scrollTo = function (selector) {
  const elem = element(by.css(selector)).getWebElement();
  browser.executeScript('arguments[0].scrollIntoView();', elem);
};

module.exports = ScreenshotComparator;
