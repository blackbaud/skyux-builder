/*jshint jasmine: true, node: true */
'use strict';
const common = require('./_common');
const tests = require('./_tests');

describe('skyux build aot', () => {

  beforeAll(common.beforeAllBuild);
  afterAll(common.afterAllBuild);

  const opts = { mode: 'easy', name: 'dist', compileMode: 'aot' };

  it('should render the home components', (done) => {
    common.serveBuild(opts)
    .then(() => {
      tests.renderHomeComponent(done);
    }, common.catchReject);
  });

  it('should render shared nav component', (done) => {
    common.serveBuild(opts)
    .then(() => {
      tests.renderSharedNavComponent(done);
    }, common.catchReject);
  });

  it('should follow routerLink and render about component', (done) => {
    common.serveBuild(opts)
    .then(() => {
      tests.followRouterLinkRenderAbout(done);
    }, common.catchReject);
  });

});
