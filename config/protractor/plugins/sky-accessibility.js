const axeBuilder = require('axe-webdriverjs');
const logger = require('../../../utils/logger');

function postTest(passed, testInfo) {
  const context = this;

  logger.info('passed?', passed);
  logger.info('testInfo?', testInfo);

  return new Promise((resolve) => {
    axeBuilder(browser.driver)
      .options(context.config.axe)
      .analyze((results) => {
        const numViolations = results.violations.length;
        const subject = (numViolations === 1) ? 'failure' : 'failures';
        logger.info(`${numViolations} accessibility ${subject} found for: ${results.url}\n`);

        if (numViolations > 0) {
          logViolations(results);
        }

        resolve();
      });
  });
}

function logViolations(results) {
  results.violations.forEach((result) => {
    const label = result.nodes.length === 1 ? 'element' : 'elements';
    const wcagTags = result.tags.filter((tags) => {
      return tags.match(/wcag\d{3}|^best*/gi);
    }).join(', ');

    const message = result.nodes.reduce((msg, node) => {
      return [
        `    Location: ${node.target[0]}`,
        `    ${node.html}`
      ].join('\n');
    }, '');

    const error = [
      `${result.nodes.length} ${label} failed '${result.id}'`,
      `    Rule: ${result.help} - WCAG: ${wcagTags}`,
      `${message}`,
      `    Get help at: ${result.helpUrl}\n`
    ].join('\n');

    logger.error(error);
  });
}

module.exports = {
  postTest
};
