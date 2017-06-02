/*jslint node: true */
'use strict';

const AxeBuilder = require('axe-webdriverjs');
import { browser } from 'protractor';

const red = "\x1b[31m";

export class A11yTest {

  //public static run(testName, driver): any {
  public static run(): any {
    const config = JSON.parse(browser.params.skyPagesConfig);
    const options = config.skyux.appSettings.a11y;

    console.log(options.runOnly.values.length);
    // const skyuxConfig = this.config.skyux;
    AxeBuilder(browser.driver)
      .options(options)
      .analyze(function (results) {
        //console.log(results);
        var numResults = results.violations.length;

        if (numResults === 0) {
          return numResults;
        }
        else if (numResults > 0) {
          console.log(red, "Accessibility failure(s) found for: " + results.url + "\n");

          results.violations.forEach(result => {
            var label = result.nodes.length === 1 ? ' element ' : ' elements ';
            //const issues = result.nodes.reduce(function(msg, node) {
//            });
            var msg = result.nodes.reduce(function(msg, node) {
                  return msg + "   Location: " + node.target[0] +  "\n   " + node.html + "\n";
                }, "\n");
            msg = result.nodes.length + label + "failed '" + result.id + "' rule: " + result.help + msg;
            console.log(red, msg + "   - Get help at: " + result.helpUrl + "\n");

          });
          return numResults;
        }

    });
  }

}
