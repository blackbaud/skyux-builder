/*jshint node: true */
'use strict';

const { browser, by, element } = require('protractor');
const hostUtils = require('../utils/host-utils');

function get(url, timeout = 0) {
  const destination = hostUtils.resolve(
    url,
    browser.params.localUrl,
    browser.params.chunks,
    browser.params.skyPagesConfig
  );

  return browser.get(destination, timeout);
}

function moveCursorOffScreen() {
  const moveToElement = element(by.css('body'));
  browser.actions().mouseMove(moveToElement, { x: 0, y: 0 }).perform();
}

function setWindowDimensions(width, height) {
  browser.driver.manage().window().setSize(width, height);
}

function setWindowBreakpoint(breakpoint) {
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
    case 'md':
      width = 992;
      height = 800;
      break;
    default:
    case 'lg':
      width = 1200;
      height = 800;
      break;
  }

  setWindowDimensions(width, height);
}

function scrollTo(selector) {
  const elem = element(by.css(selector)).getWebElement();
  browser.executeScript('arguments[0].scrollIntoView();', elem);
}

module.exports = {
  get,
  scrollTo,
  moveCursorOffScreen,
  setWindowDimensions,
  setWindowBreakpoint
};
