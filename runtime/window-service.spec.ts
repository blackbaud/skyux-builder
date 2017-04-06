import { WindowService } from './window-service';

describe('WindowService', () => {
  it('should expose a window property', () => {
    const windowService = new WindowService();
    expect(windowService.window).toBeDefined();
  });
});
