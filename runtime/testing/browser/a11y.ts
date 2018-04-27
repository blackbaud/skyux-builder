const axe = require('axe-core');

function logViolations(results: any) {
  results.violations.forEach((violation: any) => {
    const wcagTags = violation.tags
      .filter((tag: any) => tag.match(/wcag\d{3}|^best*/gi))
      .join(', ');

    const html = violation.nodes
      .reduce(
        (accumulator: any, node: any) => `${accumulator}\n${node.html}\n`,
        '       Elements:\n'
      );

    const error = [
      `aXe - [Rule: \'${violation.id}\'] ${violation.help} - WCAG: ${wcagTags}`,
      `       Get help at: ${violation.helpUrl}\n`,
      `${html}\n\n`
    ].join('\n');

    console.error(error);
  });
}

export abstract class SkyA11y {
  public static run(): Promise<any> {
    return new Promise((resolve: Function, reject: Function) => {
      const axeConfig = (window as any).SKY_APP_A11Y_CONFIG;

      console.log(`Starting accessibility checks...`);

      axe.run(axeConfig, (error: Error, results: any) => {
        if (error) {
          reject(error);
          return;
        }

        const numViolations = results.violations.length;
        const subject = (numViolations === 1) ? 'violation' : 'violations';

        console.log(`Accessibility checks finished with ${numViolations} ${subject}.\n`);

        if (numViolations > 0) {
          logViolations(results);
        }

        resolve(numViolations);
      });
    });
  }
}
