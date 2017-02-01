/*jshint jasmine: true, node: true */
/*global browser, element, by, $$*/
'use strict';

const fs = require('fs');
const path = require('path');
const common = require('./_common');
const tests = require('./_tests');

const timestamp = new Date().getTime();

describe('skyux serve', () => {

  const url = `https://localhost:31337/rrrrr-app-name/`;
  let serve;

  beforeAll((done) => {
    common.beforeAll(() => {
      common.serveIsReady().then((serveRef) => {
        serve = serveRef;
        browser.get(url).then(done);
      }, common.catchReject);
    });
  });

  afterAll((done) => {
    common.afterAll(() => {
      serve.kill();
      done();
    });
  });

  it('should render home components', tests.renderHomeComponent);
  it('should render shared nav component', tests.renderSharedNavComponent);
  it('should follow routerLink and render about component', tests.followRouterLinkRenderAbout);

  it('should should include script tags', (done) => {
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

      done();
    });
  });

  it('should watch for existing file changes', (done) => {
    const file = path.resolve(common.tmp, 'src', 'app', 'home.component.html');
    const content = fs.readFileSync(file, 'utf8');

    common.serveIsReady(serve).then(() => {
      browser.get(url).then(() => {
        expect($$('#ts').getText()).toEqual(timestamp);
        fs.writeFileSync(file, content, 'utf8');
        done();
      });
    }, common.catchReject);

    fs.writeFileSync(file, `${content}\n<p id="ts">${timestamp}</p>`, 'utf8');
  });

  it('should watch for new files', (done) => {
    const folder = path.resolve(common.tmp, 'src', 'app', 'test-dir');
    const file = path.join(folder, 'index.html');
    const message = `Test Message`;
    const tag = `h1`;

    common.serveIsReady(serve).then(() => {
      browser.get(`${url}test-dir`).then(() => {
        expect(element(by.tagName(tag)).getText()).toBe(message);
        fs.unlinkSync(file);
        fs.rmdirSync(folder);
        done();
      });
    }, common.catchReject);

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }

    fs.writeFileSync(file, `<${tag}>${message}</${tag}>`, 'utf8');
  });

});
