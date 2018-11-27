/*jshint jasmine: true, node: true */
/*global browser, element, by, $$*/
'use strict';

const fs = require('fs');
const path = require('path');
const common = require('./shared/common');
const tests = require('./shared/tests');

const timestamp = new Date().getTime();

describe('skyux serve', () => {

  let url;

  beforeAll((done) => {
    common.prepareServe().then((port) => {
      url = `https://localhost:${port}/rrrrr-app-name/`;
      browser.get(url)
        .then(done)
        .catch(err => {
          console.log(err);
          done();
        });
    }, common.catchReject);
  });

  afterAll(common.afterAll);

  it('should render home components', tests.renderHomeComponent);
  it('should render shared nav component', tests.renderSharedNavComponent);
  it('should follow routerLink and render about component', tests.followRouterLinkRenderAbout);

  it('should include script tags', (done) => {
    browser.getPageSource()
      .then(source => {
        let previousIndex = -1;
        [
          'polyfills.js',
          'app.js'
        ].forEach(file => {
          const currentIndex = source.indexOf(`<script src="${file}"></script>`);
          expect(currentIndex).toBeGreaterThan(previousIndex);
          previousIndex = currentIndex;
        });

        done();
      })
      .catch(err => {
        console.log(err);
        done();
      });
  });

  it('should watch for existing file changes', (done) => {
    const file = path.resolve(common.tmp, 'src', 'app', 'home.component.html');
    const content = fs.readFileSync(file, 'utf8');

    common.bindServe().then(() => {
      browser.get(url)
        .then(() => {
          $$('#ts').getText().then((tsResult) => {
            expect(tsResult[0]).toEqual(timestamp.toString());
            fs.writeFileSync(file, content, 'utf8');
            done();
          });

        })
        .catch(err => {
          console.log(err);
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

    common.bindServe().then(() => {
      browser.get(`${url}test-dir`)
        .then(() => {
          expect(element(by.tagName(tag)).getText()).toBe(message);
          fs.unlinkSync(file);
          fs.rmdirSync(folder);
          done();
        })
        .catch(err => {
          console.log(err);
          done();
        });
    }, common.catchReject);

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }

    fs.writeFileSync(file, `<${tag}>${message}</${tag}>`, 'utf8');
  });

});
