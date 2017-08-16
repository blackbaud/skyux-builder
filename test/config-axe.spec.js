/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');

describe('config axe', () => {
  afterEach(() => {
    mock.stopAll();
  });

  it('should return a config object', () => {
    mock('../config/sky-pages/sky-pages.config', {
      getSkyPagesConfig: () => {
        return {
          skyux: {}
        };
      }
    });
    const lib = mock.reRequire('../config/axe/axe.config');
    const config = lib.getConfig();
    expect(config).toBeDefined();
    expect(config.rules.label.enabled).toEqual(true);
  });

  it('should merge config from a consuming SPA', () => {
    mock('../config/sky-pages/sky-pages.config', {
      getSkyPagesConfig: () => {
        return {
          skyux: {
            a11y: {
              rules: {
                label: { enabled: false }
              }
            }
          }
        };
      }
    });
    const lib = mock.reRequire('../config/axe/axe.config');
    const config = lib.getConfig();
    expect(config.rules.label.enabled).toEqual(false);
  });

  it('should return defaults if rules are not defined', () => {
    mock('../config/sky-pages/sky-pages.config', {
      getSkyPagesConfig: () => {
        return {
          skyux: {
            a11y: {}
          }
        };
      }
    });
    const lib = mock.reRequire('../config/axe/axe.config');
    const config = lib.getConfig();
    expect(config.rules.label.enabled).toEqual(true);
  });

  it('should disabled all rules if accessibility is set to false', () => {
    mock('../config/sky-pages/sky-pages.config', {
      getSkyPagesConfig: () => {
        return {
          skyux: {
            a11y: false
          }
        };
      }
    });
    const lib = mock.reRequire('../config/axe/axe.config');
    const config = lib.getConfig();
    expect(config.rules.label.enabled).toEqual(false);
  });
});
