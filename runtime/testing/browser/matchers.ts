let _global: any = (typeof window === 'undefined' ? global : window);

import { SkyA11yUtil } from '../a11y-util';

interface SkyMatchResult {
  pass: any;
  message: string;
}

let skyMatchers: jasmine.CustomMatcherFactories = {
  toBeVisible: () => {
    return {
      compare: (el: Element): SkyMatchResult => {
        let result = {
          pass: false,
          message: ''
        };

        result.pass = getComputedStyle(el).display !== 'none';

        result.message = result.pass ?
          'Expected element to not be visible' :
          'Expected element to be visible';

        return result;
      }
    };
  },

  toHaveText: () => {
    return {
      compare: (el: any, expectedText: string, trimWhitespace = true): SkyMatchResult => {
        let result = {
          pass: false,
          message: ''
        };

        let actualText = el.textContent;

        if (trimWhitespace) {
          actualText = actualText.trim();
        }

        result.pass = actualText === expectedText;

        result.message = result.pass ?
          'Expected element\'s inner text not to be ' + expectedText :
          `Expected element's inner text to be:\t${expectedText}\n` +
          `Actual element's inner text was:    \t${actualText}`;

        return result;
      }
    };
  },

  toHaveCssClass: () => {
    return {
      compare: (el: any, expectedCls: string): SkyMatchResult => {
        let result = {
          pass: false,
          message: ''
        };

        if (expectedCls.indexOf('.') === 0) {
          throw new Error('Please remove the leading dot from your class name.');
        }

        result.pass = el.classList.contains(expectedCls);

        result.message = result.pass ?
          'Expected element not to have CSS class ' + expectedCls :
          'Expected element to have CSS class ' + expectedCls;

        return result;
      }
    };
  },

  toHaveStyle: () => {
    return {
      compare: (el: any, expectedStyle: any): SkyMatchResult => {
        let result = {
          pass: false,
          message: ''
        };

        for (let p in expectedStyle) {
          if (expectedStyle.hasOwnProperty(p)) {
            let actualStyle = (getComputedStyle(el) as any)[p];

            if (actualStyle !== expectedStyle[p]) {
              if (result.message) {
                result.message += '\n';
              }

              result.message += result.pass ?
                'Expected element not to have CSS style ' + p + ': ' + expectedStyle :
                'Expected element to have CSS style ' + p + ': ' + expectedStyle;
            }
          }
        }

        return result;
      }
    };
  },

  toExist: () => {
    return {
      compare: (el: any): SkyMatchResult => {
        let result = {
          pass: false,
          message: ''
        };

        result.pass = !!el;

        result.message = result.pass ?
          'Expected element not to exist' :
          'Expected element to exist';

        return result;
      }
    };
  },

  toPassA11y: () => {
    const axe = require('axe-core');
    const axeConfig = (_global as any).SKY_APP_A11Y_CONFIG;

    return {
      compare: (el: any): any => {
        const result: any = {
          message: '',
          pass: new Promise((resolve: Function, reject: Function) => {
            axe.run(axeConfig, (error: Error, results: any) => {
              // Fail the test if axe encounters an error.
              if (error) {
                _global.fail(error.message);
                reject(error);
                return;
              }

              const numViolations = results.violations.length;
              const subject = (numViolations === 1) ? 'violation' : 'violations';
              console.log(`Accessibility checks finished with ${numViolations} ${subject}.\n`);

              if (numViolations > 0) {
                const message = 'Expected element to pass accessibility checks.\n\n' +
                  SkyA11yUtil.parseMessage(results.violations);
                _global.fail(message);
              }

              resolve();
            });
          })
        };

        return result;
      }
    };
  }
};

_global.beforeEach(() => {
  jasmine.addMatchers(skyMatchers);
});

export const expect: Function = _global.expect;
