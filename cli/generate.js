/*jshint node: true*/
'use strict';

const fs = require('fs-extra');
const path = require('path');
const logger = require('@blackbaud/skyux-logger');

function safeFileWrite(pathParts, fileName, fileContent, force) {
  const resolvedFileName = path.resolve('src', 'app', ...pathParts, fileName);
  const resolvedFileExists = fs.existsSync(resolvedFileName);

  if (resolvedFileExists && !force) {
    logger.warn(`${resolvedFileName} already exists. Use --force to overwrite.`);
    return;
  }

  if (resolvedFileExists) {
    logger.warn(`${resolvedFileName} already exists. Forcefully overwriting.`);
  }

  fs.ensureDirSync(path.resolve('src', 'app', ...pathParts));
  fs.writeFileSync(resolvedFileName, fileContent);
  logger.info(`Successfully created ${resolvedFileName}.`);
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

function generateComponentTs(pathParts, fileName, name, nameSnakeCase, force) {
  const fileContent =
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
`;

  safeFileWrite(pathParts, `${fileName}.ts`, fileContent, force);
}

function generateComponentSpec(pathParts, fileName, name, nameSnakeCase, force) {
  const nameWithSpaces = properCase(nameSnakeCase.replace(/\-/g, ' '));
  const fileContent =
`import {
  TestBed
} from '@angular/core/testing';

import {
  expect,
  SkyAppTestModule
} from '@skyux-sdk/testing';

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

  safeFileWrite(pathParts, `${fileName}.spec.ts`, fileContent, force);
}

function generateComponentHtml(pathParts, fileName, force) {
  safeFileWrite(pathParts, `${fileName}.html`, '', force);
}

function generateComponentScss(pathParts, fileName, force) {
  safeFileWrite(pathParts, `${fileName}.scss`, '', force);
}

function getPathParts(name) {
  return name.replace(/\\/g, '/').split('/');
}

function generateComponent(name, force) {
  const pathParts = getPathParts(name);

  const classNameWithoutComponent = properCase(pathParts.pop());

  const className = `${classNameWithoutComponent}Component`;

  const nameSnakeCase = snakeCase(classNameWithoutComponent);

  const fileName = `${nameSnakeCase}.component`;

  generateComponentTs(pathParts, fileName, className, nameSnakeCase, force);
  generateComponentSpec(pathParts, fileName, className, nameSnakeCase, force);
  generateComponentHtml(pathParts, fileName, force);
  generateComponentScss(pathParts, fileName, force);
}

function generate(argv) {
  try {
    const type = argv._[1];
    const name = argv._[2];
    const force = argv.force;

    switch (type) {
      case 'component':
      case 'c':
        generateComponent(name, force);
        break;
    }
  } catch (err) {
    process.exit(1);
  }
}

module.exports = generate;
