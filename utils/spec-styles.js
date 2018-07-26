/*jshint node: true, jasmine: true */

'use strict';

const styleLoader = require('./sky-style-loader');

// A race condition exists in Firefox where tests can begin before styles are loaded.
// This will ensure that styles are loaded before tests run by ensuring the style rule
// for the HTML hidden property defined in sky.scss has been applied.
(function () {
  beforeAll(function (done) {
    styleLoader.loadStyles().then(done).catch((err) => {
      console.warn('[Style Loader Error]', err);
      // Allow tests to continue running even if fonts fail to load.
      done();
    });
  });
}());
