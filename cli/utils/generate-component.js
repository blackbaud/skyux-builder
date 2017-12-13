/*jshint node: true*/
'use strict';

const generatorUtils = require('./generator-utils');

function css() {
  return '';
}
function html() {
  return '';
}

function tsCode(name, fileName, nameSnakeCase) {
  return `import {
  Component
} from '@angular/core';

@Component({
  selector: 'app-${nameSnakeCase}',
  templateUrl: './${fileName}.html',
  styleUrls: ['./${fileName}.scss']
})
export class ${name} {

}
`;
}

function specCode(name, fileName, nameWithSpaces) {
  return `import {
  TestBed
} from '@angular/core/testing';

import {
  expect,
  SkyAppTestModule
} from '@blackbaud/skyux-builder/runtime/testing/browser';

import {
  ${name}
} from './${fileName}';

describe('${nameWithSpaces} component', () => {

  /**
   * This configureTestingModule function imports SkyAppTestModule, which brings in all of
   * the SKY UX modules and components in your application for testing convenience. If this has
   * an adverse effect on your test performance, you can individually bring in each of your app
   * components and the SKY UX modules that those components rely upon.
   */
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SkyAppTestModule]
    });
  });

  it('should do something', () => {
    const fixture = TestBed.createComponent(${name});

    fixture.detectChanges();

    expect(true).toBe(false);
  });

});
`;
}


function genFiles(name) {
  const pathParts = generatorUtils.getPathParts(name);

  const classNameWithoutComponent = generatorUtils.properCase(pathParts.pop());

  const className = `${classNameWithoutComponent}Component`;

  const nameSnakeCase = generatorUtils.snakeCase(classNameWithoutComponent);

  const fileName = `${nameSnakeCase}.component`;

  const nameWithSpaces = generatorUtils.properCase(nameSnakeCase.replace(/\-/g, ' '));

  generatorUtils.generateComponentFile(pathParts, fileName, '.html', html());
  generatorUtils.generateComponentFile(pathParts, fileName, '.scss', css());
  generatorUtils.generateComponentFile(pathParts, fileName, '.ts', tsCode(className, fielname, nameSnakeCase));
  generatorUtils.generateComponentFile(pathParts, fileName, '.spec', specCode(className, fileName, nameWithSpaces));
}

module.exports = {
  genFiles
}