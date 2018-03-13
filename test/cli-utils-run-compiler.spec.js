/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const logger = require('@blackbaud/skyux-logger');

describe('cli utils run compiler', () => {
  const requirePath = '../cli/utils/run-compiler';
  let mockWebpack;

  beforeEach(() => {
    mockWebpack = () => {
      return {
        run: (cb) => cb(null, {
          toJson: () => ({
            errors: [],
            warnings: []
          })
        })
      };
    };
  });

  it('should handle stats errors and warnings', (done) => {
    const errs = ['custom-error2'];
    const wrns = ['custom-warning1'];

    mockWebpack = () => {
      return {
        run: (cb) => cb(null, {
          toJson: () => ({
            errors: errs,
            warnings: wrns
          })
        })
      };
    };

    spyOn(logger, 'error');
    spyOn(logger, 'warn');
    spyOn(logger, 'info');

    const runCompiler = mock.reRequire(requirePath);

    runCompiler(mockWebpack, {}).then(() => {
      expect(logger.error).toHaveBeenCalledWith(errs);
      expect(logger.warn).toHaveBeenCalledWith(wrns);
      expect(logger.info).not.toHaveBeenCalled();
      done();
    });
  });

  it('should handle no stats errors and warnings', (done) => {
    spyOn(logger, 'error');
    spyOn(logger, 'warn');
    spyOn(logger, 'info');

    const runCompiler = mock.reRequire(requirePath);

    runCompiler(mockWebpack, {}).then(() => {
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.warn).not.toHaveBeenCalled();
      done();
    });
  });
});
