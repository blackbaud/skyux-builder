/*jshint node: true*/
'use strict';

const fs = require('fs-extra');
const path = require('path');

function resolveFilePath(pathParts, fileName) {
  fs.ensureDirSync(path.resolve('src', 'app', ...pathParts));

  return path.resolve('src', 'app', ...pathParts, fileName);
}

function properCase(name) {
  let nameProper = '';

  for (let i = 0, n = name.length; i < n; i++) {
    let c = name.charAt(i);

    if (c !== '-') {
      if (nameProper.length === 0 || name.charAt(i - 1) === '-') {
        c = c.toUpperCase();
      }

      nameProper += c;
    }
  }

  return nameProper;
}

function snakeCase(name) {
  let nameSnake = '';

  for (let i = 0, n = name.length; i < n; i++) {
    const c = name.charAt(i);
    const cLower = c.toLowerCase();

    if (i > 0 && c !== cLower) {
      nameSnake += '-';
    }

    nameSnake += cLower;
  }

  return nameSnake;
}

function generateComponentTs(pathParts, fileName, name, nameSnakeCase) {
  fs.writeFileSync(
    resolveFilePath(pathParts, fileName + '.ts'),
`import {
  Component
} from '@angular/core';

@Component({
  selector: 'app-${nameSnakeCase}',
  templateUrl: './${fileName}.html',
  styleUrls: ['./${fileName}.scss']
})
export class ${name} {

}
`
  );
}

function generateComponentSpec(pathParts, fileName, name, nameSnakeCase) {
  let nameWithSpaces = properCase(nameSnakeCase.replace(/\-/g, ' '));

  fs.writeFileSync(
    resolveFilePath(pathParts, fileName + '.spec.ts'),
`import {
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
`
  );
}

function generateComponentHtml(pathParts, fileName) {
  fs.writeFileSync(
    resolveFilePath(pathParts, fileName + '.html'),
    ''
  );
}

function generateComponentScss(pathParts, fileName) {
  fs.writeFileSync(
    resolveFilePath(pathParts, fileName + '.scss'),
    ''
  );
}

function getPathParts(name) {
  return name.replace(/\\/g, '/').split('/');
}

function generateComponent(name) {
  const pathParts = getPathParts(name);

  const classNameWithoutComponent = properCase(pathParts.pop());

  const className = `${classNameWithoutComponent}Component`;

  const nameSnakeCase = snakeCase(classNameWithoutComponent);

  const fileName = `${nameSnakeCase}.component`;

  generateComponentTs(pathParts, fileName, className, nameSnakeCase);
  generateComponentSpec(pathParts, fileName, className, nameSnakeCase);
  generateComponentHtml(pathParts, fileName);
  generateComponentScss(pathParts, fileName);
}

function generate(argv) {
  try {
    let type = argv._[1];
    let name = argv._[2];

    switch (type) {
      case 'component':
      case 'c':
        generateComponent(name);
        break;
    }

    process.exit(0);
  } catch (err) {
    process.exit(1);
  }
}

module.exports = generate;
