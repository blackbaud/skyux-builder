/*jslint node: true */
'use strict';

var AxeBuilder = require('axe-webdriverjs');
import { browser } from 'protractor';

export class A11yTester {

  //public static run(testName, driver): any {
  public static run(): any {
    const config = JSON.parse(browser.params.skyPagesConfig);
    const options = config.skyux.appSettings.a11y;

    // const skyuxConfig = this.config.skyux;
    AxeBuilder(browser.driver)
      .options(options)
      .analyze(function (results) {
        console.log(results);
    });
  }
}
