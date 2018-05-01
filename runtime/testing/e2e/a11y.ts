import { SkyA11yUtil } from '../a11y-util';

const logger = require('@blackbaud/skyux-logger');
const axeBuilder = require('axe-webdriverjs');
const protractor = require('protractor');

export abstract class SkyA11y {
  public static run(): Promise<any> {
    return protractor.browser.getCurrentUrl()
      .then((url: string) => new Promise((resolve) => {
        const axeConfig = require('../../../config/axe/axe.config');
        const config = axeConfig.getConfig();

        axeBuilder(protractor.browser.driver)
          .options(config)
          .analyze((results: any) => {
            const numViolations = results.violations.length;
            const subject = (numViolations === 1) ? 'violation' : 'violations';

            logger.info(`Accessibility checks finished with ${numViolations} ${subject}.\n`);

            if (numViolations > 0) {
              const message = SkyA11yUtil.parseMessage(results.violations);
              logger.error(message);
            }

            resolve(numViolations);
          });
      }));
  }
}
