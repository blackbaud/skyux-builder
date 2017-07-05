/*jslint node: true */
'use strict';

const axeBuilder = require('axe-webdriverjs');
import { browser } from 'protractor';

export class SkyA11y {

  public static log(results): any {
      console.error('Accessibility failure(s) found for: ' + results.url + '\n');
      results.violations.forEach(result => {
        const label = result.nodes.length === 1 ? 'element' : 'elements';
        const wcagTags = result.tags.filter(function(tags){
          return tags.match(/wcag\d{3}|^best*/gi);
        });
        const msg = result.nodes.reduce(function(m, node) {
            return `${m}  Location: ${node.target[0]}
  ${node.html}`;
}, '\n');
        console.error(`${result.nodes.length} ${label} failed '${result.id}' \
        Rule: ${result.help} - WCAG: ${wcagTags}  ${msg}
  Get help at: ${result.helpUrl}
`);
      });
  }

  public static run(): Promise<Number> {
    const config = JSON.parse(browser.params.skyPagesConfig);
    const options = config.skyux.appSettings.a11y;

    return new Promise(resolve => {
      axeBuilder(browser.driver)
        .options(options)
        .analyze(results => {
          const violations = results.violations.length;
          if (violations) {
            SkyA11y.log(results);
          }
          resolve(violations);
        });
    });
  }
}
