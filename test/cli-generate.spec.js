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
      writeFileSync: jasmine.createSpy('writeFileSync')
    };

    mock('fs-extra', fsMock);

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
});
