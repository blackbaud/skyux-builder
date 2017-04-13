/*jshint jasmine: true, node: true */
/*global browser, element, by, $$*/
'use strict';

const common = require('./shared/common');

describe('skyux test', () => {
  it('should successfully run unit tests', (done) => {
    common.exec(`node`, [common.cliPath, `test`], common.cwdOpts)
      .then(exit => {
        expect(exit).toEqual(0);
        done();
      })
      .catch(err => console.log(err));
  });
})
