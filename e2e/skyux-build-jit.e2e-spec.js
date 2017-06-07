/*jshint jasmine: true, node: true */
'use strict';
const common = require('./shared/common');
const tests = require('./shared/tests');

function prepareBuild() {
  const opts = { mode: 'easy', name: 'dist', compileMode: 'jit' };
  return common.prepareBuild(opts)
    .catch(err => console.error);
}

describe('skyux build jit', () => {
  describe('w/base template', () => {
    beforeAll((done) => prepareBuild().then(done));

    it('should have exitCode 0', tests.verifyExitCode);

    it('should generate expected static files', tests.verifyFiles);

    it('should render the home components', tests.renderHomeComponent);

    it('should render shared nav component', tests.renderSharedNavComponent);

    it('should follow routerLink and render about component', tests.followRouterLinkRenderAbout);

    afterAll(common.afterAll);
  });

  describe('w/guard', () => {
    beforeAll((done) => {
      const guard = `
import { Injectable } from '@angular/core';

@Injectable()
export class AboutGuard {
  canActivate(next: any, state: any) {
    return false;
  }
}
`;

      common.writeAppFile('about/index.guard.ts', guard)
        .then(() => prepareBuild())
        .then(done)
        .catch(console.error);
    });

    it('should not follow routerLink when guard returns false', tests.respectGuardCanActivate);

    afterAll((done) => {
      common.removeAppFile('about/index.guard.ts')
        .then(() => common.afterAll())
        .then(done)
        .catch(console.error);
    });
  });
});
