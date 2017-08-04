/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const logger = require('../utils/logger');

describe('config protractor plugin sky accessibility', () => {
  let browser;
  let context;

  beforeEach(() => {
    context = {
      config: {
        axe: {}
      }
    };

    browser = {
      getCurrentUrl: () => {
        return Promise.resolve('http://foo.bar');
      }
    };
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should return a promise', () => {
    mock('axe-webdriverjs', function MockAxeBuilder() {
      return {
        options: () => {
          return {
            analyze: (callback) => Promise.resolve()
          };
        }
      };
    });

    spyOn(logger, 'info').and.returnValue();
    spyOn(logger, 'error').and.returnValue();

    const plugin = mock.reRequire('../config/protractor/plugins/sky-accessibility');
    const result = plugin.onPageStable.call(context, browser);
    expect(typeof result.then).toEqual('function');
  });

  it('should print a message to the console', (done) => {
    mock('axe-webdriverjs', function MockAxeBuilder() {
      return {
        options: () => {
          return {
            analyze: (callback) => {
              callback({
                violations: []
              });
              expect(logger.info.calls.argsFor(1)[0])
                .toContain(`Accessibility checks finished with 0 violations.`);
              done();
              return Promise.resolve();
            }
          };
        }
      };
    });

    spyOn(logger, 'info').and.returnValue();
    spyOn(logger, 'error').and.returnValue();

    const plugin = mock.reRequire('../config/protractor/plugins/sky-accessibility');
    const result = plugin.onPageStable.call(context, browser);
  });

  it('should log violations', (done) => {
    mock('axe-webdriverjs', function MockAxeBuilder() {
      return {
        options: () => {
          return {
            analyze: (callback) => {
              callback({
                violations: [{
                  id: 'label',
                  help: 'Description here.',
                  helpUrl: 'https://foo.bar',
                  nodes: [{ html: '<p></p>' }],
                  tags: ['cat.forms', 'wcag2a', 'wcag332', 'wcag131']
                }]
              });
              expect(logger.info.calls.argsFor(1)[0])
                .toContain(`Accessibility checks finished with 1 violation.`);
              expect(logger.error.calls.argsFor(0)[0])
                .toContain('aXe - [Rule: label] Description here. - WCAG: wcag332, wcag131');
              done();
              return Promise.resolve();
            }
          };
        }
      };
    });

    spyOn(logger, 'info').and.returnValue();
    spyOn(logger, 'error').and.returnValue();

    const plugin = mock.reRequire('../config/protractor/plugins/sky-accessibility');
    const result = plugin.onPageStable.call(context, browser);
  });
});
