/*jshint node: true, jasmine: true */
'use strict';

const mock = require('mock-require');

describe('Host browser', () => {
  let mockProtractor;
  let mockHostUtils;
  let mockBrowserActions;
  let mockWindowActions;

  beforeEach(() => {
    mockBrowserActions = {
      mouseMove() {
        return {
          perform() {}
        };
      }
    };

    mockWindowActions = {
      setSize() {}
    };

    mockProtractor = {
      browser: {
        driver: {
          manage() {
            return {
              window() {
                return mockWindowActions;
              }
            };
          }
        },
        actions() {
          return mockBrowserActions;
        },
        executeScript() {},
        get() {},
        params: {}
      },
      by: {
        css: (selector) => selector
      },
      element: (value) => value
    };

    mockHostUtils = {
      resolve() {}
    };

    mock('protractor', mockProtractor);
    mock('../utils/host-utils', mockHostUtils);
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should navigate to a URL', () => {
    spyOn(mockHostUtils, 'resolve').and.returnValue('url');
    const spy = spyOn(mockProtractor.browser, 'get').and.callThrough();
    const { get } = mock.reRequire('../lib/host-browser');
    get();
    expect(spy).toHaveBeenCalledWith('url', 0);
  });

  it('should move cursor off screen', () => {
    const spy = spyOn(mockBrowserActions, 'mouseMove').and.callThrough();
    const { moveCursorOffScreen } = mock.reRequire('../lib/host-browser');
    moveCursorOffScreen();
    expect(spy).toHaveBeenCalledWith('body', { x: 0, y: 0 });
  });

  it('should set window dimensions', () => {
    const spy = spyOn(mockWindowActions, 'setSize').and.callThrough();
    const { setWindowDimensions } = mock.reRequire('../lib/host-browser');
    setWindowDimensions(5, 6);
    expect(spy).toHaveBeenCalledWith(5, 6);
  });

  it('should set window width for a breakpoint', () => {
    const spy = spyOn(mockWindowActions, 'setSize').and.callThrough();
    const { setWindowBreakpoint } = mock.reRequire('../lib/host-browser');

    setWindowBreakpoint('xs');
    expect(spy).toHaveBeenCalledWith(480, 800);
    spy.calls.reset();

    setWindowBreakpoint('sm');
    expect(spy).toHaveBeenCalledWith(768, 800);
    spy.calls.reset();

    setWindowBreakpoint('md');
    expect(spy).toHaveBeenCalledWith(992, 800);
    spy.calls.reset();

    setWindowBreakpoint('lg');
    expect(spy).toHaveBeenCalledWith(1200, 800);
    spy.calls.reset();

    setWindowBreakpoint();
    expect(spy).toHaveBeenCalledWith(1200, 800);
  });

  it('should scroll to element', () => {
    spyOn(mockProtractor, 'element').and.returnValue({
      getWebElement() {
        return 'element';
      }
    });

    const spy = spyOn(mockProtractor.browser, 'executeScript').and.callThrough();
    const { scrollTo } = mock.reRequire('../lib/host-browser');
    scrollTo('body');
    expect(spy).toHaveBeenCalledWith('arguments[0].scrollIntoView();', 'element');
  });
});
