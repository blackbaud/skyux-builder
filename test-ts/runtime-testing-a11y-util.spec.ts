import { SkyA11yUtil } from '../runtime/testing/a11y-util';

describe('A11y util', () => {
  it('should return a formatted message for all violations', () => {
    const message = SkyA11yUtil.parseMessage([
      {
        help: 'Help message here.',
        helpUrl: 'https://help-url.com',
        id: 'foo-id',
        nodes: [
          {
            html: '<p></p>'
          }
        ],
        tags: ['wcag311']
      }
    ]);

    expect(message).toContain(`Rule: 'foo-id'`);
    expect(message).toContain(`Help message here.`);
    expect(message).toContain(`WCAG: wcag311`);
    expect(message).toContain(`Get help at: https://help-url.com`);
    expect(message).toContain(`<p></p>`);
  });

  it('should return an empty message for zero violations', () => {
    expect(SkyA11yUtil).toBeDefined();

    const message = SkyA11yUtil.parseMessage([]);
    expect(message).toEqual('');
  });
});
