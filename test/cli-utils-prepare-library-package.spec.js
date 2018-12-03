/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');

describe('cli utils prepare-library-package', () => {
  let util;
  let mockFsExtra;
  let mockLogger;

  beforeEach(() => {
    mockFsExtra = {
      copySync() {},
      existsSync() {
        return true;
      },
      readJsonSync() {
        return {};
      },
      writeJsonSync() {}
    };

    mockLogger = {
      error() {},
      info() {},
      warn() {}
    };

    mock('@blackbaud/skyux-logger', mockLogger);

    mock('fs-extra', mockFsExtra);

    mock('../config/sky-pages/sky-pages.config', {
      spaPath: (...args) => args.join('/')
    });
    util = mock.reRequire('../cli/utils/prepare-library-package');
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should return a function', () => {
    expect(typeof util).toEqual('function');
  });

  it('should update the module property of package.json and write it to dist', () => {
    const readSpy = spyOn(mockFsExtra, 'readJsonSync').and.returnValue({});
    const writeSpy = spyOn(mockFsExtra, 'writeJsonSync').and.callFake((filePath, contents) => {
      expect(filePath.match('dist')).not.toEqual(null);
      expect(contents.module).toEqual('index.js');
    });

    util();

    expect(readSpy).toHaveBeenCalled();
    expect(writeSpy).toHaveBeenCalled();
  });

  it('should copy readme, changelog, and assets to dist', () => {
    const copySpy = spyOn(mockFsExtra, 'copySync').and.returnValue();

    util();

    expect(copySpy).toHaveBeenCalledWith('README.md', 'dist/README.md');
    expect(copySpy).toHaveBeenCalledWith('CHANGELOG.md', 'dist/CHANGELOG.md');
    expect(copySpy).toHaveBeenCalledWith('src/assets', 'dist/src/assets');
  });

  it('should warn consumers if they do not include a readme, changelog, or assets', () => {
    spyOn(mockFsExtra, 'existsSync').and.callFake((file) => {
      if (file === 'README.md') {
        return false;
      }

      return true;
    });

    const loggerSpy = spyOn(mockLogger, 'warn');

    util();

    expect(loggerSpy).toHaveBeenCalledWith('File(s) not found: README.md');
  });
});
