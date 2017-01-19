/*jshint jasmine: true, node: true */
/*global browser*/
'use strict';

const common = require('./_common');

describe('skyux serve', () => {

  beforeAll(common.beforeAll);
  afterAll(common.afterAll);

  it('should should include script tags', (done) => {
    common.spawnServe(done).then((serve) => {
      browser.get(`https://localhost:31337/rrrrr-app-name/`);
      browser.getPageSource().then(source => {
        let previousIndex = -1;
        [
          'polyfills.js',
          'vendor.js',
          'skyux.js',
          'app.js'
        ].forEach(file => {
          const currentIndex = source.indexOf(`<script src="${file}"></script>`);
          expect(currentIndex).toBeGreaterThan(previousIndex);
          previousIndex = currentIndex;
        });

        serve.kill();
      });
    });
  });

});
