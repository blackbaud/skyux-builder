/*jshint node: true, jasmine: true */
'use strict';

const mock = require('mock-require');

describe('Screenshot comparator', () => {
  beforeEach(() => {
    mock('protractor', {
      browser: {
        pixDiff: {
          checkRegion() {
            return Promise.resolve();
          }
        }
      },
      by: {
        css() {}
      },
      element() {}
    });
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should', () => {
    const comparator = mock.reRequire('../lib/screenshot-comparator');
    expect(typeof comparator.compareScreenshot).toEqual('function');
  });
});
