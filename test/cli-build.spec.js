/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const logger = require('winston');

describe('cli build', () => {

  it('should call getWebpackConfig', () => {
    let called = false;
    mock('../config/webpack/build.webpack.config', {
      getWebpackConfig: () => {
        called = true;
        return {};
      }
    });

    require('../cli/build')({}, {}, () => ({
      run: () => {}
    }));
    expect(called).toEqual(true);
  });

  it('should call webpack and handle fatal error', (done) => {
    spyOn(logger, 'error');
    mock('../config/webpack/build.webpack.config', {
      getWebpackConfig: () => ({})
    });

    require('../cli/build')({}, {}, () => ({
      run: (cb) => {
        cb('custom-error1');
        expect(logger.error).toHaveBeenCalledWith('custom-error1');
        done();
      }
    }));
  });

  it('should call webpack and handle stats errors and warnings', (done) => {
    const errs = ['custom-error2'];
    const wrns = ['custom-warning1'];

    spyOn(logger, 'error');
    spyOn(logger, 'warn');
    spyOn(logger, 'info');

    mock('../config/webpack/build.webpack.config', {
      getWebpackConfig: () => ({})
    });

    require('../cli/build')({}, {}, () => ({
      run: (cb) => {
        cb(null, {
          toJson: () => ({
            errors: errs,
            warnings: wrns
          })
        });
        expect(logger.error).toHaveBeenCalledWith(errs);
        expect(logger.warn).toHaveBeenCalledWith(wrns);
        expect(logger.info).toHaveBeenCalled();
        done();
      }
    }));
  });

});
