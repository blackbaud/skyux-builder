/*jshint jasmine: true, node: true */
'use strict';

const common = require('./shared/common');

function validateTestRun(done) {
  common.exec(`node`, [common.cliPath, `e2e`], common.cwdOpts)
    .then(exit => {
      expect(exit).toEqual(0);
      done();
    })
    .catch(err => console.log(err));
}

describe('skyux e2e', () => {
  it('should successfully run e2e tests', (done) => {
    validateTestRun(done);
  });

  describe('with auth', () => {
    beforeAll((done) => {
      const opts = { mode: 'easy', name: 'dist', auth: true };
      common.prepareBuild(opts).then(done);
    });

    afterAll(common.afterAll);

    fit('should successfully run e2e tests', (done) => {
      validateTestRun(done);
    });
  });
});
