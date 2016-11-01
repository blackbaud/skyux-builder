/*jshint jasmine: true, node: true */
'use strict';

describe('webpack module loader', () => {

  let loader;
  beforeEach(() => {
    loader = require('../loader/sky-pages-module/index');
  });

  it('should return a source string', () => {
    const source = loader.apply({
      options: {
        SKY_PAGES: {
          entries: []
        }
      }
    });
    expect(source).toBeDefined();
  });

  it('should add the NotFoundComponent if it does not exist', () => {
    const source = loader.apply({
      options: {
        SKY_PAGES: {
          entries: [
            {
              path: '',
              pathWeb: '',
              pathParts: [
                ''
              ],
              siblings: [
                {
                  path: '',
                  pathWeb: '',
                  pathParts: [
                    ''
                  ],
                  get: () => ''
                }
              ],
              get: () => ''
            }
          ]
        }
      }
    });
    expect(source).toContain("template: '404'");
  });

  it('should not add the NotFoundComponent if it exists', () => {
    const source = loader.apply({
      options: {
        SKY_PAGES: {
          entries: [
            {
              path: '',
              pathWeb: '',
              pathParts: [
                ''
              ],
              siblings: [
                {
                  path: 'not-found.component.ts',
                  pathWeb: 'not-found.component.ts',
                  pathParts: [
                    'not-found.component.ts'
                  ],
                  get: () => 'class NotFoundComponent () {}'
                }
              ],
              get: () => ''
            }
          ]
        }
      }
    });
    expect(source).toContain('NotFoundComponent');
    expect(source).not.toContain("template: '404'");
  });

  it('should import sibling components', () => {
    const source = loader.apply({
      options: {
        SKY_PAGES: {
          entries: [
            {
              path: '',
              pathWeb: '',
              pathParts: [
                ''
              ],
              siblings: [
                {
                  path: 'me.component.ts',
                  pathWeb: 'me.component.ts',
                  pathParts: [
                    'me.component.ts'
                  ],
                  get: () => 'class MeComponent {}'
                }
              ],
              get: () => ''
            }
          ]
        }
      }
    });
    expect(source).toContain("import { MeComponent } from 'sky-pages-spa/me.component'");
  });

  it('should generate a component name', () => {
    const source = loader.apply({
      options: {
        SKY_PAGES: {
          entries: [
            {
              path: 'myPath',
              pathWeb: 'myPath',
              pathParts: [
                'myPath'
              ],
              siblings: [],
              get: () => ''
            }
          ]
        }
      }
    });
    expect(source).toContain('MypathIndexComponent');
  });

  it('should support route parameters', () => {
    const source = loader.apply({
      options: {
        SKY_PAGES: {
          entries: [
            {
              path: 'path/{custom}/index.html',
              pathWeb: 'path/:custom/index.html',
              pathParts: [
                'path',
                '{custom}',
                'index.html'
              ],
              siblings: [],
              get: () => ''
            }
          ]
        }
      }
    });
    expect(source).toContain("this.custom = params['custom'];");
    expect(source).toContain(
      'class PathCustomIndexhtmlIndexComponent implements OnInit, OnDestroy {'
    );
  });

});
