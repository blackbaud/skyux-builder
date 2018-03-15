/*jshint node: true, jasmine: true */
'use strict';

const mock = require('mock-require');

describe('Screenshot comparator', () => {
  let mockPixDiff;
  let mockHostBrowser;
  let mockProtractor;
  let mockLogger;

  beforeEach(() => {
    mockPixDiff = {
      checkRegion() {
        return Promise.resolve();
      }
    };

    mockHostBrowser = {
      moveCursorOffScreen() {},
      setWindowBreakpoint() {}
    };

    mockProtractor = {
      browser: {
        pixDiff: mockPixDiff
      },
      by: {
        css: (selector) => selector
      },
      element: (value) => value
    };

    mockLogger = {
      info() {},
      error() {}
    };

    mock('../lib/host-browser', mockHostBrowser);
    mock('protractor', mockProtractor);
    mock('../utils/logger', mockLogger);
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should compare exact screenshots', () => {
    const checkRegionSpy = spyOn(mockPixDiff, 'checkRegion').and.returnValue(
      Promise.resolve({
        code: 7,
        differences: 1,
        dimensions: 1
      })
    );

    const expectSpy = spyOn(global, 'expect').and.callThrough();
    const breakpointSpy = spyOn(mockHostBrowser, 'setWindowBreakpoint').and.callThrough();
    const comparator = mock.reRequire('../lib/screenshot-comparator');

    comparator.compareScreenshot({
      selector: 'h1',
      screenshotName: 'heading',
      breakpoint: 'sm'
    }).then(() => {
      const args = checkRegionSpy.calls.argsFor(0);
      expect(args[0]).toEqual('h1');
      expect(args[1]).toEqual('heading');
      expect(args[2].threshold).toEqual(0.02);
      expect(expectSpy).toHaveBeenCalledWith(true);
      expect(breakpointSpy).toHaveBeenCalledWith('sm');
    }).catch(e => console.log(e));
  });

  it('should compare similar screenshots', () => {
    const checkRegionSpy = spyOn(mockPixDiff, 'checkRegion').and.returnValue(
      Promise.resolve({
        code: 5,
        differences: 1,
        dimensions: 1
      })
    );

    const expectSpy = spyOn(global, 'expect').and.callThrough();
    const breakpointSpy = spyOn(mockHostBrowser, 'setWindowBreakpoint').and.callThrough();
    const comparator = mock.reRequire('../lib/screenshot-comparator');

    comparator.compareScreenshot({
      selector: undefined,
      screenshotName: 'footer',
      breakpoint: 'lg'
    }).then(() => {
      const args = checkRegionSpy.calls.argsFor(0);
      expect(args[0]).toEqual('body');
      expect(args[1]).toEqual('footer');
      expect(args[2].threshold).toEqual(0.02);
      expect(expectSpy).toHaveBeenCalledWith(true);
      expect(breakpointSpy).toHaveBeenCalledWith('lg');
    }).catch(e => console.log(e));
  });

  it('should handle new images being created', () => {
    spyOn(mockPixDiff, 'checkRegion').and.returnValue(
      Promise.reject(new Error(
        'saving current image'
      ))
    );

    const loggerSpy = spyOn(mockLogger, 'info').and.callThrough();
    const comparator = mock.reRequire('../lib/screenshot-comparator');

    comparator.compareScreenshot({
      selector: 'h1',
      screenshotName: 'heading',
      breakpoint: 'sm'
    }).then(() => {
      expect(loggerSpy).toHaveBeenCalledWith('[heading]', 'saving current image');
    }).catch(e => console.log(e));
  });

  it('should handle errors', () => {
    spyOn(mockPixDiff, 'checkRegion').and.returnValue(
      Promise.reject(new Error(
        'something bad happened'
      ))
    );

    const comparator = mock.reRequire('../lib/screenshot-comparator');

    comparator.compareScreenshot().then(() => {
      expect(comparator.compareScreenshot).toThrow();
    }).catch(err => {
      expect(err.message).toEqual('something bad happened');
    });
  });
});
