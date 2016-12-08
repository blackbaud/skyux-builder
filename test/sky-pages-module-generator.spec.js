/*jshint jasmine: true, node: true */
'use strict';

describe('SKY Pages module generator', () => {

  let generator;
  beforeEach(() => {
    generator = require('../lib/sky-pages-module-generator');
  });

  it('should return a source string', () => {
    const source = generator.getSource({});
    expect(source).toBeDefined();
  });

  it('should add the NotFoundComponent if it does not exist', () => {
    const source = generator.getSource({});
    expect(source).toContain("template: '404'");
  });

  it('should not add the NotFoundComponent if it exists', () => {
    const source = generator.getSource({
      components: [
        {
          importPath: 'not-found.component.ts',
          componentName: 'NotFoundComponent'
        }
      ]
    });
    expect(source).toContain('NotFoundComponent');
    expect(source).not.toContain("template: '404'");
  });

  it('should allow the SKY Pages out alias to be overridden', () => {
    const source = generator.getSource({
      skyPagesOutAlias: '..'
    });

    expect(source).toContain(
      `import { AppExtrasModule } from '../app-extras.module';`
    );
  });

  it('should allow the SKY UX path alias to be overridden', () => {
    const source = generator.getSource({
      skyuxPathAlias: '../../..'
    });

    expect(source).toContain(
      `import { SkyModule } from '../../../core';`
    );
  });

});
