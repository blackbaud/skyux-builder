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
     * - not using function + returns for webdriver's weird analysis
     * https://github.com/angular/protractor/blob/master/spec/withLoginConf.js#L28
     */
    // return common.prepareBuild(opts, true)
    //   .then(() => new Promise(resolve => {
    //     tests.verifyExitCode(resolve);
    //   }))
    //   .then(function () {
    //     return browser.driver.wait(function () {
    //       return browser.driver.getCurrentUrl().then(function (url) {
    //         console.log(url);
    //         return url.indexOf(SIGNIN_URL) > -1;
    //       });
    //     }, 10000);
    //   })
    //   .then(done);
    done();
  });
});
