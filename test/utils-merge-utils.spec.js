/*jshint jasmine: true, node: true */
'use strict';

const merge = require('../utils/merge');

describe('merge-utils', () => {
  it('should return a merged object with overridden arrays', () => {
    let original = {
      arr: ['stringOne', 'stringTwo'],
      objArr: [{
        test: 'test'
      },
      {
        test: 'testTwo'
      }]
    };
    let override = {
      arr: ['stringThree'],
      objArr: [{
        test: 'override'
      },
      {
        test: 'changed',
        nested: {
          deep: 'nested key'
        }
      }]
    };

    let result = merge(original, override);
    expect(result.arr.length).toBe(1);
    expect(result.arr).not.toContain('stringTwo');
    expect(result.objArr.length).toBe(2);
    expect(result.objArr[0].test).toBe('override');
    expect(result.objArr[1].nested.deep).toBe('nested key');
  });
});
