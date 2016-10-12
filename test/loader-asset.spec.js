/*jshint jasmine: true, node: true */
'use strict';

describe('webpack asset loader', () => {

  let loader;
  beforeEach(() => {
    loader = require('../loader/sky-pages-asset/index');
  });

  it('should ignore any assets that don\'t match', () => {
    const source = loader.apply({
      query: {},
      options: {
        SKY_PAGES: {
          assets: {}
        }
      }
    }, ['my-source']);
    expect(source).toEqual('my-source');
  });

  it('should add each asset as a dependency and call it\'s get method', () => {

    let addDependencyCalled = false;
    let getCalled = false;

    loader.apply({
      addDependency: () => {
        addDependencyCalled = true;
      },

      query: {
        key: 'my-custom-key'
      },
      options: {
        SKY_PAGES: {
          assets: {
            'my-custom-key': [
              {
                path: '',
                get: () => {
                  getCalled = true;
                }
              }
            ]
          }
        }
      }
    });

    expect(addDependencyCalled).toEqual(true);
    expect(getCalled).toEqual(true);
  });
});
