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
  public canActivate(next: any, state: any): boolean {
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
      common.removeAppFolderItem('about/index.guard.ts')
        .then(() => common.afterAll())
        .then(done)
        .catch(console.error);
    });
  });

  describe('w/root level guard', () => {
    beforeAll((done) => {
      const guard = `
import { Injectable } from '@angular/core';

@Injectable()
export class RootGuard {
  public canActivateChild(next: any, state: any) {
    return false;
  }
}
`;

      common.writeAppFile('index.guard.ts', guard)
        .then(() => prepareBuild())
        .then(done)
        .catch(console.error);
    });

    it('should respect root guard', tests.respectRootGuard);

    afterAll((done) => {
      common.removeAppFolderItem('index.guard.ts')
        .then(() => common.afterAll())
        .then(done)
        .catch(console.error);
    });
  });

  describe('w/child routes', () => {
    beforeAll((done) => {
      common.verifyAppFolder('test')
        .then(() => common.writeAppFile('index.html', '<a id="test" routerLink="/test">Test</a>'))
        .then(() => common.writeAppFile(
          'test/index.html',
          '<h1>Hi</h1>' +
          '<a id="child" routerLink="/test/child">Child</a>' +
          '<a id="top" routerLink="/test/child/top">Top</a>' +
          '<router-outlet></router-outlet>')
        )
        .then(() => common.verifyAppFolder('test/#child'))
        .then(() => common.writeAppFile('test/#child/index.html', '<div id="text">Child</div>'))
        .then(() => common.verifyAppFolder('test/#child/top'))
        .then(() => common.writeAppFile('test/#child/top/index.html', '<div id="text">Top</div>'))
        .then(() => prepareBuild())
        .then(done)
        .catch(console.error);
    });

    it('should have working child route', tests.verifyChildRoute);

    it('should have working nested child route', tests.verifyNestedChildRoute);

    it('should have working top level route inside child route folder', tests.verifyNestedTopRoute);

    afterAll((done) => {
      common.removeAppFolderItem('test/#child/top/index.html')
        .then(() => common.writeAppFile('index.html', '<my-home></my-home>'))
        .then(() => common.removeAppFolderItem('test'))
        .then(() => common.afterAll())
        .then(done)
        .catch(console.error);
    });
  });
});
