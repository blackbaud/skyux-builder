/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const logger = require('@blackbaud/skyux-logger');

describe('cli build', () => {
  beforeEach(() => {
    spyOn(logger, 'info');
    spyOn(logger, 'error');
  });

  it('should log when the build is completed successfully', (done) => {
    mock('../cli/utils/run-build', () => Promise.resolve());

    mock.reRequire('../cli/build')('build', {}, {}).then(() => {
      expect(logger.info).toHaveBeenCalledWith('Build successfully completed.');
      done();
    });
  });

  it('should return build stats when the build is completed successfully', (done) => {
    mock('../cli/utils/run-build', () => Promise.resolve({ foo: 'bar' }));

    mock.reRequire('../cli/build')('build', {}, {}).then((stats) => {
      expect(stats.foo).toEqual('bar');
      done();
    });
  });

  it('should log errors and set exit code to 1', (done) => {
    const errors = 'errors';

    spyOn(process, 'exit');

    mock('../cli/utils/run-build', () => Promise.reject(errors));

    mock.reRequire('../cli/build')('build', {}, {}).then(() => {
      expect(logger.error).toHaveBeenCalledWith(errors);
      expect(process.exit).toHaveBeenCalledWith(1);
      done();
    });
  });

});
