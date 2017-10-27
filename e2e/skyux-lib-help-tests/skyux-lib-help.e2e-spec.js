/*jshint jasmine: true, node: true */
/*global browser, element, by, $$*/
'use strict';

const fs = require('fs');
const path = require('path');
const common = require('../shared/common');
const tests = require('../shared/tests');

const tmpSrcApp = path.resolve(process.cwd(), common.tmp, 'src/app');
const e2eRootPath = path.resolve(process.cwd(), 'e2e/skyux-lib-help-tests');

let originalHomePage;

// Add the SkyModalDemoFormComponent to the entryComponents in the app-extras module.
const mockAppExtras = `
import { NgModule } from '@angular/core';

import { SkyModalDemoFormComponent } from './modal-fixtures/modal-form-fixture.component';

@NgModule({
  providers: [],
  entryComponents: [
    SkyModalDemoFormComponent
  ]
})
export class AppExtrasModule { }
`;

function prepareBuild() {
  const configOptions = {
    mode: 'easy',
    name: 'dist',
    compileMode: 'aot',
    help: {
      extends: 'bb-help'
    }
  };

  return common.prepareBuild(configOptions)
    .catch(console.error);
}

function migrateFixtures() {
  const files = fs.readdirSync(`${e2eRootPath}/fixtures/skyux-modal`);

  if (!fs.existsSync(`${tmpSrcApp}/modal-fixtures`)) {
    fs.mkdirSync(`${tmpSrcApp}/modal-fixtures`);
  }

  files.forEach(file => {
    const filePath = path.resolve(`${e2eRootPath}/fixtures/skyux-modal`, file);
    const content = fs.readFileSync(filePath, 'utf8');
    common.writeAppFile(`modal-fixtures/${file}`, content);
  });
}

function addModalToHomePage() {
  migrateFixtures();
  if (!originalHomePage) {
    originalHomePage = fs.readFileSync(`${tmpSrcApp}/home.component.html`, 'utf8');
  }

  common.writeAppExtras(mockAppExtras);
  const content = `<help-modal-launcher></help-modal-launcher>`;
  common.writeAppFile('home.component.html', content, 'utf8');
}

describe('skyux lib help', () => {
  beforeAll((done) => {
    prepareBuild()
    .then(() => {
      done();
    });
    addModalToHomePage();
  });

  afterAll(() => {
    common.writeAppFile('home.component.html', originalHomePage, 'utf8');
    common.removeAppFolder('modal-fixtures');
    common.afterAll();
  });


  /**
   * Skyux 2 adds a class to the body element 'sky-modal-body-full-page'. When this class is found
   * the css from builder's app.component.scss file should cause the invoker from the Help Widget
   * to be display: none. This test is to confirm that neither library has changed the dependent
   * css classes to accomplish this.
   */
  it('should hide the invoker when a full page modal is opened', () => {
    let invoker = element(by.id('bb-help-invoker'));
    let regularModalButton = element(by.id('regular-modal-launcher'));
    let fullPageButton = element(by.id('full-page-modal-launcher'));

    expect(invoker.isDisplayed()).toBe(true);

    regularModalButton.click();
    expect(invoker.isDisplayed()).toBe(true);
    element(by.id('modal-close-button')).click();

    fullPageButton.click();
    expect(invoker.isDisplayed()).toBe(false);
    element(by.id('modal-close-button')).click();
  });
});
