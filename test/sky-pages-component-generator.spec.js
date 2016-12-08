/*jshint jasmine: true, node: true */
'use strict';

describe('SKY Pages component generator', () => {

  let generator;
  beforeEach(() => {
    generator = require('../lib/sky-pages-component-generator');
  });

  it('should extract a component name', () => {
    const fs = require('fs');
    const glob = require('glob');
    const file = 'me.component.ts';

    spyOn(glob, 'sync').and.returnValue([file]);
    spyOn(fs, 'readFileSync').and.returnValue('class MyCustomComponent');

    const components = generator.getComponents({});
    expect(components.names).toContain('MyCustomComponent');
  });

  it('should throw an error if a component name could not be extracted', () => {
    const fs = require('fs');
    const glob = require('glob');
    const file = 'my-component.component.ts';

    spyOn(glob, 'sync').and.returnValue([file]);
    spyOn(fs, 'readFileSync').and.returnValue('file without a class');

    const err = new Error(`Unable to locate an exported class in ${file}`);
    expect(function () { generator.getComponents({}); }).toThrow(err);
  });

  it('should import components', () => {
    const components = generator.getComponents({
      components: [
        {
          importPath: 'me.component',
          componentName: 'MeComponent'
        }
      ]
    });

    expect(components.names).toContain('MeComponent');
    expect(components.imports).toContain(
      `import { MeComponent } from 'me.component'`
    );
  });

  it('should allow the SPA path alias to be overridden', () => {
    const fs = require('fs');
    const glob = require('glob');
    const file = 'me.component.ts';

    spyOn(glob, 'sync').and.returnValue([file]);
    spyOn(fs, 'readFileSync').and.returnValue('class MyComponent');

    const components = generator.getComponents({
      spaPathAlias: '../../',
    });

    expect(components.imports).toContain(
      `import { MyComponent } from '../../me.component'`
    );
  });

});
