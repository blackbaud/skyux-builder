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

    // Only reliable way I found to "force reload" the page (causing auth redirect)
    // was to use the executScript below.  Also, using browser.driver.getCurrentUrl
    // in order to bypass Angular dependency on page.
    common.prepareBuild(opts, true)
      .then(() => {
        browser.wait(() => {
          browser.driver.getCurrentUrl().then(url => url.indexOf(SIGNIN_URL) > -1);
        });
      })
      .then(() => tests.verifyExitCode(done));
  });
});
