/*jshint node: true */
'use strict';

const axeBuilder = require('axe-webdriverjs');
const { browser } = require('protractor');

const logger = require('@blackbaud/skyux-logger');
const axeConfig = require('../config/axe/axe.config');

function run() {
  return browser
    .getCurrentUrl()
    .then(url => new Promise((resolve) => {
      const config = axeConfig.getConfig();

      logger.info(`Starting accessibility checks for ${url}...`);

      axeBuilder(browser.driver)
        .options(config)
        .analyze((results) => {
          const numViolations = results.violations.length;
          const subject = (numViolations === 1) ? 'violation' : 'violations';

          logger.info(`Accessibility checks finished with ${numViolations} ${subject}.\n`);

          if (numViolations > 0) {
            logViolations(results);
          }

          resolve(numViolations);
        });
    }));
}

function logViolations(results) {
  results.violations.forEach((violation) => {
    const wcagTags = violation.tags
      .filter(tag => tag.match(/wcag\d{3}|^best*/gi))
      .join(', ');

    const html = violation.nodes
      .reduce(
        (accumulator, node) => `${accumulator}\n${node.html}\n`,
        '       Elements:\n'
      );

    const error = [
      `aXe - [Rule: \'${violation.id}\'] ${violation.help} - WCAG: ${wcagTags}`,
      `       Get help at: ${violation.helpUrl}\n`,
      `${html}\n\n`
    ].join('\n');

    logger.error(error);
  });
}

module.exports = {
  run
};
