/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const path = require('path');
const logger = require('winston');
const tslint = require('tslint');

describe('SKY UX tslint Webpack loader', () => {
  const loaderPath = '../loader/sky-tslint';
  let context;

  beforeEach(() => {
    context = {
      resourcePath: path.resolve(__dirname, 'fixtures', 'loader-tslint.fixture.ts'),
      async: () => () => {}
    };

    // mock('../config/sky-pages/sky-pages.config', {
    //   spaPath: (fileName) => fileName
    // });
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should execute tslint for source files', (done) => {
    mock('../config/sky-pages/sky-pages.config', {
      spaPath: (fileName) => path.resolve(__dirname, 'fixtures', fileName)
    });
    spyOn(tslint.Linter.prototype, 'lint').and.callThrough();
    const loader = require(loaderPath);
    let callback = (err, input, map) => {
      expect(err).toBeUndefined();
      expect(tslint.Linter.prototype.lint).toHaveBeenCalled();
      done();
    };
    context.async = () => callback;
    loader.call(context, '');
  });

  it('should handle tslint errors', (done) => {
    // const loader = require(loaderPath);
    // let callback = (err, input, map) => {
    //   expect(err).toBeDefined();
    //   done();
    // };
    // context.async = () => callback;
    // try {
    //   loader.call(context, '');
    // } catch(err) {
    //   console.log('error!', err);
    // }
    done();
  });
});
