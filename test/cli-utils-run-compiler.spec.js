/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const logger = require('@blackbaud/skyux-logger');

describe('cli utils run compiler', () => {
  const requirePath = '../cli/utils/run-compiler';
  let mockWebpack;

  beforeEach(() => {
    spyOn(logger, 'error');
    spyOn(logger, 'warn');
    spyOn(logger, 'info');

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

  it('should reject compilation errors', (done) => {
    const err = ['custom-error1'];
    mockWebpack = () => {
      return {
        run: (cb) => cb(err)
      };
    };

    const runCompiler = mock.reRequire(requirePath);
    runCompiler(mockWebpack, {}).catch(e => {
      expect(e).toBe(err);
      expect(logger.error).not.toHaveBeenCalled();
      done();
    });
  });

  it('should reject stats errors', (done) => {
    const errs = ['custom-error2'];

    mockWebpack = () => {
      return {
        run: (cb) => cb(null, {
          toJson: () => ({
            errors: errs,
            warnings: []
          })
        })
      };
    };

    const runCompiler = mock.reRequire(requirePath);

    runCompiler(mockWebpack, {}).catch((e) => {
      expect(e).toBe(errs);
      expect(logger.error).not.toHaveBeenCalled();
      done();
    });
  });

  it('should handle stats warnings', (done) => {
    const wrns = ['custom-warning1'];

    mockWebpack = () => {
      return {
        run: (cb) => cb(null, {
          toJson: () => ({
            errors: [],
            warnings: wrns
          })
        })
      };
    };

    const runCompiler = mock.reRequire(requirePath);

    runCompiler(mockWebpack, {}).then(() => {
      expect(logger.warn).toHaveBeenCalledWith(wrns);
      done();
    });
  });

  it('should handle no stats errors and warnings', (done) => {
    const runCompiler = mock.reRequire(requirePath);

    runCompiler(mockWebpack, {}).then(() => {
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.warn).not.toHaveBeenCalled();
      done();
    });
  });
});
