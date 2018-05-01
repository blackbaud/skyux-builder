import rewiremock from 'rewiremock';

// Attach rewire spies to some of the module imports,
// before importing the SkyA11y file.
let mockAxeBuilder: any = {};
(rewiremock('@blackbaud/skyux-logger').with({}) as any).dynamic();
(rewiremock('protractor').with({}) as any).dynamic();
(rewiremock('axe-webdriverjs').with(function () {
  return {
    options() {
      return mockAxeBuilder;
    }
  };
}) as any).dynamic();
rewiremock.enable();

import { SkyA11y } from '../runtime/testing/e2e/a11y';

const mock = require('mock-require');

describe('e2e SkyA11y', () => {
  let mockLogger: any;
  let mockProtractor: any;

  beforeEach(() => {
    mockLogger = {
      error() {},
      info() {}
    };

    mockProtractor = {
      browser: {
        getCurrentUrl() {
          return Promise.resolve('https//foo.com');
        }
      },
      by: {
        css(selector: string) {
          return selector;
        }
      },
      element(value: any) {
        return value;
      }
    };

    mockAxeBuilder = {
      analyze(callback: Function) {
        callback({
          violations: []
        });
      }
    };

    mock('../config/axe/axe.config', {
      getConfig() {}
    });
  });

  afterAll(() => {
    rewiremock.disable();
    mock.stopAll();
  });

  function applyMocks() {
    rewiremock.getMock('@blackbaud/skyux-logger').with(mockLogger);
    rewiremock.getMock('protractor').with(mockProtractor);
  }

  it('should run a11y checks on the current URL', (done) => {
    const loggerSpy = spyOn(mockLogger, 'info').and.callThrough();
    applyMocks();
    SkyA11y.run().then((numViolations: number) => {
      expect(numViolations).toEqual(0);
      expect(loggerSpy).toHaveBeenCalledWith('Accessibility checks finished with 0 violations.\n');
      done();
    });
  });

  it('should log violations', (done) => {
    mockAxeBuilder.analyze = (callback: Function) => {
      callback({
        violations: [{
          help: 'Help message here.',
          helpUrl: 'https://help-url.com',
          id: 'foo-id',
          nodes: [
            {
              html: '<p></p>'
            }
          ],
          tags: ['wcag311']
        }]
      });
    };

    const infoSpy = spyOn(mockLogger, 'info').and.callThrough();
    const errorSpy = spyOn(mockLogger, 'error').and.callThrough();
    applyMocks();
    SkyA11y.run().then((numViolations: number) => {
      expect(numViolations).toEqual(1);
      expect(infoSpy).toHaveBeenCalledWith('Accessibility checks finished with 1 violation.\n');
      expect(errorSpy.calls.argsFor(0)[0])
        .toContain(`[Rule: 'foo-id'] Help message here.`);
      done();
    });
  });
});
