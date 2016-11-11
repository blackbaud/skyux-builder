/*jshint jasmine: true, node: true */
'use strict';

describe('SKY Pages module generator', () => {

  let generator;
  beforeEach(() => {
    generator = require('../lib/sky-pages-module-generator');
  });

  it('should return a source string', () => {
    const source = generator.getSource({
      entries: []
    });
    expect(source).toBeDefined();
  });

  it('should add the NotFoundComponent if it does not exist', () => {
    const source = generator.getSource({
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
    });
    expect(source).toContain("template: '404'");
  });

  it('should not add the NotFoundComponent if it exists', () => {
    const source = generator.getSource({
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
    });
    expect(source).toContain('NotFoundComponent');
    expect(source).not.toContain("template: '404'");
  });

  it('should import sibling components', () => {
    const source = generator.getSource({
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
    });

    expect(source).toContain(
`import {
  MeComponent
} from 'sky-pages-spa/me.component'`
    );
  });

  it('should generate a component name', () => {
    const source = generator.getSource({
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
    });
    expect(source).toContain('MypathIndexComponent');
  });

  it('should support route parameters', () => {
    const source = generator.getSource({
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
    });
    expect(source).toContain("this.custom = params['custom'];");
    expect(source).toContain(
      'class PathCustomIndexhtmlIndexComponent implements OnInit, OnDestroy {'
    );
  });

  it('should allow the SKY Pages out alias to be overridden', () => {
    const source = generator.getSource(
      {
        entries: [
          {
            path: 'path/index.html',
            pathWeb: 'path/index.html',
            pathParts: [
              'path',
              'index.html'
            ],
            siblings: [],
            get: () => ''
          }
        ],
      },
      '..'
    );

    expect(source).toContain(
      `import { AppExtrasModule } from '../app-extras.module';`
    );
  });

  it('should allow the SPA path alias to be overridden', () => {
    const source = generator.getSource(
      {
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
      },
      undefined,
      '../..'
    );

    expect(source).toContain(
`import {
  MeComponent
} from '../../me.component'`
    );
  });

  it('should allow the SKY UX path alias to be overridden', () => {
    const source = generator.getSource(
      {
        entries: [
          {
            path: '',
            pathWeb: '',
            pathParts: [
              ''
            ],
            siblings: [],
            get: () => ''
          }
        ]
      },
      undefined,
      undefined,
      '../../..'
    );

    expect(source).toContain(
      `import { SkyModule } from '../../../core';`
    );
  });

  it('should use the templateUrl property when specified', () => {
    const source = generator.getSource(
      {
        entries: [
          {
            path: 'path/index.html',
            pathWeb: 'path/index.html',
            pathParts: [
              'path',
              'index.html'
            ],
            siblings: [],
            get: () => ''
          }
        ],
      },
      undefined,
      undefined,
      undefined,
      true
    );

    expect(source).toContain('templateUrl: \'sky-pages-spa/path/index.html\'');
  });

});
