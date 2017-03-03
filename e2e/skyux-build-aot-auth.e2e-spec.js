/*jshint jasmine: true, node: true */
/*global browser, expect*/
'use strict';

const common = require('./shared/common');
const tests = require('./shared/tests');

describe('skyux build aot with auth', () => {

  let opts;
  beforeAll(() => {
    opts = { mode: 'easy', name: 'dist', compileMode: 'aot', auth: true };
  });

  afterAll(common.afterAll);

  it('should build and redirect to the signin page', (done) => {
    common.prepareBuild(opts)
      .catch(() => {
        browser.driver.getCurrentUrl().then(url => {
          expect(url.indexOf('https://signin.blackbaud.com/')).toBeGreaterThan(-1);
          tests.verifyExitCode(done);
        });
      });
  });

});
