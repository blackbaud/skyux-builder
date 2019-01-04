/*jslint node: true */
/*global ROOT_DIR*/
/*global skyPagesConfig*/
'use strict';

require('zone.js/dist/zone');
require('zone.js/dist/zone-testing');

require('reflect-metadata');

const testing = require('@angular/core/testing');
const browser = require('@angular/platform-browser-dynamic/testing');

// First, initialize the Angular testing environment.
testing.getTestBed().initTestEnvironment(
  browser.BrowserDynamicTestingModule,
  browser.platformBrowserDynamicTesting()
);

// Then we find all the tests.
const testContext = skyPagesConfig.runtime.command === 'pact' ?
  require.context(ROOT_DIR, true, /\.pact-spec\.ts/) :
  require.context(ROOT_DIR, true, /\.spec\.ts/);

// And load the modules.
function requireAll(requireContext) {
  return requireContext.keys().map(requireContext);
}

requireAll(testContext);
