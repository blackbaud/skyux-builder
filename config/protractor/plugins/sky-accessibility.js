const axeBuilder = require('axe-webdriverjs');
const logger = require('../../../utils/logger');

function onPageStable(browser) {
  const context = this;
  return browser.getCurrentUrl().then((url) => {
    logger.info(`Starting accessibility checks for ${url}...`);
    return new Promise((resolve) => {
      axeBuilder(browser.driver)
        .options(context.config.axe)
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
    const label = violation.nodes.length === 1 ? 'element' : 'elements';
    const wcagTags = violation.tags.filter((tags) => {
      return tags.match(/wcag\d{3}|^best*/gi);
    }).join(', ');

    const message = violation.nodes.reduce((accumulator, node) => {
      return `${accumulator}\n${node.html}\n`;
    }, '       Elements:\n');

    const error = [
      `aXe - [Rule: ${violation.id}] ${violation.help} - WCAG: ${wcagTags}`,
      `       Get help at: ${violation.helpUrl}\n`,
      `${message}\n\n`
    ].join('\n');

    logger.error(error);
  });
}

module.exports = {
  onPageStable,
  name: 'SkyAccessibility'
};
