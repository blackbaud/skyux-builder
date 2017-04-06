/*jshint jasmine: true, node: true */
'use strict';
const common = require('./shared/common');
const tests = require('./shared/tests');

describe('skyux build aot with the omnibar', () => {

  beforeAll((done) => {
    const opts = {
      mode: 'easy',
      name: 'dist',
      compileMode: 'aot',
      omnibar: {
        serviceName: 'MyService'
      }
    };
    common.prepareBuild(opts).then(done);
  });

  afterAll(common.afterAll);

  it('should have exitCode 0', tests.verifyExitCode);

  it('should generate expected static files', tests.verifyFiles);

  it('should render the home components', tests.renderHomeComponent);

  it('should render shared nav component', tests.renderSharedNavComponent);

  it('should follow routerLink and render about component', tests.followRouterLinkRenderAbout);

});
