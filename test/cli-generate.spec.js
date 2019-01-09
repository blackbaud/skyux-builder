/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const path = require('path');

function escapeRegExp(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

describe('cli generate', () => {
  function validateComponent(
    nameArg,
    expectedPathParts,
    expectedFileName,
    expectedClassName,
    expectedSelector,
    expectedDescribe,
    expectedExitCode
  ) {
    let fsMock;

    function resolvePath(ext) {
      return path.resolve('src', 'app', ...expectedPathParts, `${expectedFileName}.${ext}`);
    }

    function validateTSFile(stringMatch) {
      expect(fsMock.writeFileSync).toHaveBeenCalledWith(
        resolvePath('ts'),
        jasmine.stringMatching(escapeRegExp(stringMatch))
      );
    }

    function validateScssFile() {
      expect(fsMock.writeFileSync).toHaveBeenCalledWith(
        resolvePath('scss'),
        ''
      );
    }

    function validateHtmlFile() {
      expect(fsMock.writeFileSync).toHaveBeenCalledWith(
        resolvePath('html'),
        ''
      );
    }

    function validateSpecFile(stringMatch) {
      expect(fsMock.writeFileSync).toHaveBeenCalledWith(
        resolvePath('spec.ts'),
        jasmine.stringMatching(escapeRegExp(stringMatch))
      );
    }

    expectedExitCode = expectedExitCode || 0;

    fsMock = {
      ensureDirSync: jasmine.createSpy('ensureDirSync'),
      writeFileSync: jasmine.createSpy('writeFileSync'),
      existsSync: jasmine.createSpy('existsSync').and.returnValue(false)
    };

    mock('fs-extra', fsMock);
    mock('@blackbaud/skyux-logger', jasmine.createSpyObj('logger', ['info', 'warn']));

    spyOn(process, 'exit').and.returnValue();

    const generate = mock.reRequire('../cli/generate');

    generate({
      _: [
        'generate',
        'component',
        nameArg
      ]
    });

    if (expectedExitCode === 0) {
      // process.exit() should not be called on success so that other Builder
      // plugins can tap into the generate command.
      expect(process.exit).not.toHaveBeenCalled();

      expect(fsMock.ensureDirSync).toHaveBeenCalledWith(
        path.resolve('src', 'app', ...expectedPathParts)
      );

      validateTSFile(
`@Component({
  selector: '${expectedSelector}',
  templateUrl: './${expectedFileName}.html',
  styleUrls: ['./${expectedFileName}.scss']
})
export class ${expectedClassName}`
      );

      validateScssFile();
      validateHtmlFile();

      validateSpecFile(
`import {
  ${expectedClassName}
} from './${expectedFileName}';`
      );

      validateSpecFile(`describe('${expectedDescribe}', () => {`);
      validateSpecFile(`const fixture = TestBed.createComponent(${expectedClassName});`);
    } else {
      expect(process.exit).toHaveBeenCalledWith(expectedExitCode);
    }
  }

  afterEach(() => {
    mock.stopAll();
  });

  it('should generate a component', () => {
    validateComponent(
      'my-test',
      [],
      'my-test.component',
      'MyTestComponent',
      'app-my-test',
      'My test component'
    );
  });

  it('should generate a component in a sub-directory', () => {
    validateComponent(
      '/subdir1/subdir2/my-test',
      ['subdir1', 'subdir2'],
      'my-test.component',
      'MyTestComponent',
      'app-my-test',
      'My test component'
    );
  });

  it('should handle proper-case names', () => {
    validateComponent(
      'MyTest',
      [],
      'my-test.component',
      'MyTestComponent',
      'app-my-test',
      'My test component'
    );
  });

  it('should handle invalid input', () => {
    validateComponent(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      1
    );
  });

  function generateSafe(force) {
    const name = 'my-component';
    const pathMock = jasmine.createSpyObj('path', ['resolve']);
    const fsMock = jasmine.createSpyObj('fs', [
      'ensureDirSync',
      'existsSync',
      'writeFileSync'
    ]);
    const loggerMock = jasmine.createSpyObj('logger', ['info', 'warn']);

    pathMock.resolve.and.returnValue('resolved-' + name);
    fsMock.existsSync.and.returnValue(true);

    mock('path', pathMock);
    mock('fs-extra', fsMock);
    mock('@blackbaud/skyux-logger', loggerMock);

    const generate = mock.reRequire('../cli/generate');
    generate({
      _: [
        'generate',
        'component',
        name
      ],
      force: force
    });

    if (force) {
      expect(fsMock.writeFileSync).toHaveBeenCalled();
      expect(loggerMock.warn.calls.argsFor(0)).toEqual([
        `resolved-${name} already exists. Forcefully overwriting.`
      ]);
    } else {
      expect(fsMock.writeFileSync).not.toHaveBeenCalled();
      expect(loggerMock.warn).toHaveBeenCalledWith(
        `resolved-${name} already exists. Use --force to overwrite.`
      );
    }

    mock.stopAll();
  }

  it('should log a warning and exit if a file already exists', () => {
    generateSafe(false);
  });

  it('should log a warning and continue writing if force is supplied', () => {
    generateSafe(true);
  });
});
