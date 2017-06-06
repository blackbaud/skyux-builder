/*jslint node: true */
'use strict';

const AxeBuilder = require('axe-webdriverjs');
import { browser } from 'protractor';

export class A11yTest {

  public static log(results): any {
      //console.error(`${violations}`);
      var numResults = results.violations.length;

      if (numResults > 0) {
        console.error("Accessibility failure(s) found for: " + results.url + "\n");
        results.violations.forEach(result => {
          var label = result.nodes.length === 1 ? 'element' : 'elements';
          var msg = result.nodes.reduce(function(msg, node) {
              return `${msg}  Location: ${node.target[0]}
  ${node.html}`;
          }, "\n");
          console.error(`${result.nodes.length} ${label} failed '${result.id}' rule: ${result.help} ${msg}
  Get help at: ${result.helpUrl}.
`)
        });
      }
  }

  public static run(): Promise<Number> {
    const config = JSON.parse(browser.params.skyPagesConfig);
    const options = config.skyux.appSettings.a11y;

    return new Promise(resolve => {
      AxeBuilder(browser.driver)
        .options(options)
        .analyze(results => {
          const violations = results.violations.length;
          if (violations) {
            A11yTest.log(results);
          }
          var fail = results.violations.length === 1 ? ' failure' : ' failures';
          resolve(violations + fail);
        });
    });
  }

}
