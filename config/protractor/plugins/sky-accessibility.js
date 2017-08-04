/*jshint node: true */
'use strict';

const axeBuilder = require('axe-webdriverjs');
const logger = require('../../../utils/logger');

function onPageStable(browser) {
  /* jshint validthis: true */
  const _this = this;

  return browser
    .getCurrentUrl()
    .then((url) => {

      logger.info(`Starting accessibility checks for ${url}...`);

      return new Promise((resolve) => {
        axeBuilder(browser.driver)
          .options(_this.config.axe)
          .analyze((results) => {
            const numViolations = results.violations.length;
            const subject = (numViolations === 1) ? 'violation' : 'violations';

            logger.info(`Accessibility checks finished with ${numViolations} ${subject}.\n`);

            if (numViolations > 0) {
              logViolations(results);
            }

            resolve();
          });
      });
    });
}

function logViolations(results) {
  results.violations.forEach((violation) => {
    const wcagTags = violation.tags
      .filter((tag) => tag.match(/wcag\d{3}|^best*/gi))
      .join(', ');

    const html = violation.nodes
      .reduce(
        (accumulator, node) => `${accumulator}\n${node.html}\n`,
        '       Elements:\n'
      );

    const error = [
      `aXe - [Rule: ${violation.id}] ${violation.help} - WCAG: ${wcagTags}`,
      `       Get help at: ${violation.helpUrl}\n`,
      `${html}\n\n`
    ].join('\n');

    logger.error(error);
  });
}

module.exports = {
  onPageStable,
  name: 'SkyAccessibility'
};
