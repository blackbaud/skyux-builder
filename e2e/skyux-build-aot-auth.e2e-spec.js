/*jshint jasmine: true, node: true */
/*global browser, expect*/
'use strict';

const common = require('./shared/common');
const tests = require('./shared/tests');

describe('skyux build aot with auth', () => {

  beforeAll(common.beforeAll);
  afterAll(common.afterAll);

  it('should build and redirect to the signin page', (done) => {

    const SIGNIN_URL = 'https://signin.blackbaud.com/';
    const opts = {
      mode: 'easy',
      name: 'dist',
      compileMode: 'aot',
      auth: true
    };

    /**
     * This is a strange test for several reasons.
     * - Using browser.driver in order to bypass angular requirement (not on signin page)
     * - wait method must return (if I wasnt using short arrow) in order to unsubscribe from event.
     */
    common.prepareBuild(opts, true)
      .then(() => browser.wait(() =>
        browser.driver.getCurrentUrl().then(url => url.indexOf(SIGNIN_URL) > -1)
      ))
      .then(() => {
        tests.verifyExitCode(done);
      });
  });
});
