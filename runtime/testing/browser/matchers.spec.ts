import { expect } from './matchers';

describe('Browser jasmine matchers', () => {
  it('should check element visibility', () => {
    const elem = document.createElement('div');
    document.body.appendChild(elem);
    expect(elem).toBeVisible();

    elem.style.display = 'none';
    expect(elem).not.toBeVisible();
  });
});
