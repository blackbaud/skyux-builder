/*jshint node: true */
'use strict';

const { browser } = require('protractor');
const hostUtils = require('../utils/host-utils');

const get = function (url, timeout = 0) {
  const destination = hostUtils.resolve(
    url,
    browser.params.localUrl,
    browser.params.chunks,
    browser.params.skyPagesConfig
  );

  return browser.get(destination, timeout);
};

const resizeWindow = function (width, height) {
  browser.driver.manage().window().setSize(width, height);
};

function HostBrowser() { }

HostBrowser.get = get;
HostBrowser.resizeWindow = resizeWindow;

module.exports = HostBrowser;
