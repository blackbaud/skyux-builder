/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const tslint = require('tslint');

describe('SKY UX tslint Webpack loader', () => {
  const loaderPath = '../loader/sky-tslint';
  let context;

  beforeEach(() => {
    context = {};

    mock('../config/sky-pages/sky-pages.config', {
      spaPath: (fileName) => fileName
    });

    mock('../loader/sky-tslint/program', {
      getProgram: () => {}
    });

    spyOn(tslint.Configuration, 'findConfiguration').and.returnValue({
      results: {}
    });

    spyOn(tslint.Linter.prototype, 'lint').and.returnValue(undefined);
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should execute tslint for source files', (done) => {
    spyOn(tslint.Linter.prototype, 'getResult').and.returnValue({
      failures: []
    });

    const callback = (err, input, map) => {
      expect(err).toBeUndefined();
      expect(tslint.Configuration.findConfiguration).toHaveBeenCalled();
      expect(tslint.Linter.prototype.lint).toHaveBeenCalled();
      expect(tslint.Linter.prototype.getResult).toHaveBeenCalled();
      done();
    };
    context.async = () => callback;

    const loader = require(loaderPath);
    loader.call(context, '');
  });

  it('should handle tslint errors', (done) => {
    spyOn(tslint.Linter.prototype, 'getResult').and.returnValue({
      failures: ['failed'],
      output: 'Failed.'
    });

    const callback = (err, input, map) => {
      expect(err).toBeDefined();
      done();
    };
    context.async = () => callback;

    const loader = require(loaderPath);
    loader.call(context, '');
  });
});
