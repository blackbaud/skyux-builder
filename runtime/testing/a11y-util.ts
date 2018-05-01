export abstract class SkyA11yUtil {
  public static parseMessage(violations: any[]): string {
    let message = '';
    violations.forEach((violation: any) => {
      const wcagTags = violation.tags
        .filter((tag: any) => tag.match(/wcag\d{3}|^best*/gi))
        .join(', ');

      const html = violation.nodes.reduce((accumulator: string, node: any) => {
        return `${accumulator}\n${node.html}\n`;
      }, '       Elements:\n');

      const error = [
        `aXe - [Rule: \'${violation.id}\'] ${violation.help} - WCAG: ${wcagTags}`,
        `       Get help at: ${violation.helpUrl}\n`,
        `${html}\n\n`
      ].join('\n');

      message += `${error}\n`;
    });

    return message;
  }
}
