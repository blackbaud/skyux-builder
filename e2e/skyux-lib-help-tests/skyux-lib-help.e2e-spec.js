/*jshint jasmine: true, node: true */
/*global browser, element, by, $$*/
'use strict';
const fs = require('fs');
const path = require('path');
const common = require('../shared/common');
const tests = require('../shared/tests');

function prepareBuild() {
  const opts = {
    mode: 'easy',
    name: 'dist',
    compileMode: 'aot',
    help: {
      extends: 'bb-help'
    }
  };

  return common.prepareBuild(opts)
    .catch(console.error);
}

function addModalToHomePage() {
  const rootPath = './e2e/skyux-lib-help-tests/fixtures/skyux-modal/';
  const files = fs.readdirSync(rootPath);

  files.forEach(file => {
    const filePath = path.resolve(rootPath, file);
    const content = fs.readFileSync(filePath, 'utf8');
    common.writeAppFile(file, content);
  });

  const resolvedFilePath = path.join(path.resolve(common.tmp), 'src', 'app');
  // common.addEntryComponentToAppExtras(
  //   'SkyModalDemoFormComponent',
  //   path.join(resolvedFilePath, 'modal-form-fixture.component')
  // );

  const file = path.resolve(common.tmp, 'src', 'app', 'home.component.html');
  fs.writeFileSync(file, `<help-modal-launcher></help-modal-launcher>`, 'utf8');
}

fdescribe('skyux lib help', () => {
  beforeAll((done) => prepareBuild().then(done));
  addModalToHomePage();

  it('should launch a modal', () => {
    addModalToHomePage();
    debugger;
    browser.pause();
    let invoker = $$('#bb-help-invokerssss');
    expect(invoker).toBeDefined();
  });
});
