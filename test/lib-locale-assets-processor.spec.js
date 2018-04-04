/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');

const PROCESSOR_PATH = '../lib/locale-assets-processor';

describe('Locale assets processor', () => {
  let mockFs;
  let mockGlob;
  let mockPath;
  let mockSkyPagesConfigUtil;

  let originalProcessOn;
  let processEvents;

  function triggerProcessOn(eventName) {
    processEvents[eventName].forEach(listener => listener());
  }

  beforeEach(() => {
    processEvents = {};
    originalProcessOn = process.on;
    Object.defineProperty(process, 'on', {
      value: (eventName, callback) => {
        processEvents[eventName] = processEvents[eventName] || [];
        processEvents[eventName].push(callback);
      },
      writable: true
    });

    spyOn(process, 'exit').and.callFake(() => triggerProcessOn('exit'));

    mockFs = {
      copySync() {},
      emptyDirSync() {},
      ensureDirSync() {},
      ensureFileSync() {},
      readFileSync() {
        return Buffer.from('{}', 'utf8');
      },
      removeSync() {},
      writeJsonSync() {}
    };

    mockGlob = {
      sync() {}
    };

    mockPath = {
      basename: (filePath) => filePath.split('/').pop(),
      join: (...args) => args.join('/')
    };

    mockSkyPagesConfigUtil = {
      spaPath: (...args) => args.join('/')
    };

    mock('fs-extra', mockFs);
    mock('glob', mockGlob);
    mock('path', mockPath);
    mock('../config/sky-pages/sky-pages.config', mockSkyPagesConfigUtil);
  });

  afterEach(() => {
    mock.stopAll();
    Object.defineProperty(process, 'on', {
      value: originalProcessOn
    });
  });

  it('should test if a file path is a locale file', () => {
    const processor = mock.reRequire(PROCESSOR_PATH);

    const test1 = processor.isLocaleFile('resources_en_US.json');
    const test2 = processor.isLocaleFile('resources_en_us.json');
    const test3 = processor.isLocaleFile('resources-en_US.json');
    const test4 = processor.isLocaleFile('foo.html');

    expect(test1).toEqual(true);
    expect(test2).toEqual(false);
    expect(test3).toEqual(false);
    expect(test4).toEqual(false);
  });

  it('should resolve the physical location of a locale file', () => {
    const processor = mock.reRequire(PROCESSOR_PATH);
    const filePath = processor.resolvePhysicalLocaleFilePath('resources_en_US.json');
    expect(filePath).toEqual('.skypageslocales/resources_en_US.json');
  });

  it('should resolve the relative destination of a locale file', () => {
    const processor = mock.reRequire(PROCESSOR_PATH);
    const filePath = processor.resolveRelativeLocaleFileDestination('resources_en_US.json');
    expect(filePath).toEqual('assets/locales/resources_en_US.json');
  });

  it('should copy all SPA locale files to a temp directory', () => {
    const files = {
      'resources_en_US.json': '/src/assets/locales/resources_en_US.json',
      'resources_fr_CA.json': '/src/assets/locales/resources_fr_CA.json'
    };

    spyOn(mockGlob, 'sync').and.returnValue(
      Object.keys(files).map(k => files[k])
    );

    const spy = spyOn(mockFs, 'copySync').and.callThrough();
    const processor = mock.reRequire(PROCESSOR_PATH);

    processor.prepareLocaleFiles();

    Object.keys(files).forEach((key) => {
      expect(spy).toHaveBeenCalledWith(
        files[key],
        '.skypageslocales/' + key
      );
    });
  });

  it('should extend SPA files with library files', () => {
    // Locale files and their contents:
    const files = {
      'src/assets/locales/resources_en_US.json': {
        spa_key1: { _description: '', message: '[en_US] spa message 1' },
        spa_key2: { _description: '', message: '[en_US] spa message 2' }
      },
      'src/assets/locales/resources_*.json': {
        spa_key1: { _description: '', message: '[fr_CA] spa message 1' },
        spa_fr_key1: { _description: '', message: '[fr_CA] spa fr message' }
      },
      // Tests that the `en-US` format also works (along with `en_US`):
      '/node_modules/@blackbaud/skyux-lib-foo/assets/locales/resources_en-US.json': {
        lib_key1: { _description: '', message: '[en_US] lib message 1' },
        lib_key2: { _description: '', message: '[en_US] lib message 2' }
      },
      '/node_modules/@blackbaud/skyux-lib-foo/assets/locales/resources_fr_CA.json': {
        lib_fr_key: { _description: '', message: '[fr_CA] lib fr message' },
        lib_key2: { _description: '', message: '[fr_CA] lib message 2' }
      },
      '/node_modules/@blackbaud-internal/skyux-lib-bar/assets/locales/resources_en_US.json': {
        lib_internal_key1: { _description: '', message: '[en_US] lib internal message 1' },
        lib_internal_key2: { _description: '', message: '[en_US] lib internal message 2' }
      },
      '/node_modules/@blackbaud-internal/skyux-lib-bar/assets/locales/resources_fr_CA.json': {
        lib_internal_fr_key: { _description: '', message: '[fr_CA] lib internal fr message' },
        lib_internal_key2: { _description: '', message: '[fr_CA] lib internal message 2' }
      },
      '/node_modules/@blackbaud-internal/skyux-lib-bar/assets/locales/resources_en_CA.json': {
        lib_internal_en_ca_key: { _description: '', message: '[en_CA] lib internal en_CA message' }
      }
    };

    // Prefill SPA files in the temp directory.
    files['.skypageslocales/resources_en_US.json'] = files['src/assets/locales/resources_en_US.json'];
    files['.skypageslocales/resources_fr_CA.json'] = files['src/assets/locales/resources_*.json'];

    spyOn(mockGlob, 'sync').and.callFake(expression => {
      console.log('expression:', expression);
      let globFiles;
      switch (expression) {
        // Default library files
        case 'node_modules/@blackbaud/**/src/assets/locales/@(resources_en_US.json|resources_en-US.json)':
        globFiles = [
          '/node_modules/@blackbaud/skyux-lib-foo/assets/locales/resources_en-US.json'
        ];
        break;

        // All library files
        case 'node_modules/@blackbaud/**/src/assets/locales/resources_*.json':
        globFiles = [
          '/node_modules/@blackbaud/skyux-lib-foo/assets/locales/resources_en-US.json',
          '/node_modules/@blackbaud/skyux-lib-foo/assets/locales/resources_fr_CA.json'
        ];
        break;

        // Default internal library files
        case 'node_modules/@blackbaud-internal/**/src/assets/locales/@(resources_en_US.json|resources_en-US.json)':
        globFiles = [
          '/node_modules/@blackbaud-internal/skyux-lib-bar/assets/locales/resources_en_US.json'
        ];
        break;

        // All internal library files
        case 'node_modules/@blackbaud-internal/**/src/assets/locales/resources_*.json':
        globFiles = [
          '/node_modules/@blackbaud-internal/skyux-lib-bar/assets/locales/resources_en_US.json',
          '/node_modules/@blackbaud-internal/skyux-lib-bar/assets/locales/resources_fr_CA.json',
          '/node_modules/@blackbaud-internal/skyux-lib-bar/assets/locales/resources_en_CA.json'
        ];
        break;

        // All SPA files
        case 'src/assets/locales/resources_*.json':
        globFiles = [
          'src/assets/locales/resources_en_US.json',
          'src/assets/locales/resources_*.json'
        ];
        break;

        case '.skypageslocales/resources_*.json':
        globFiles = [];
        break;
      }

      return globFiles;
    });

    spyOn(mockFs, 'readFileSync').and.callFake((filePath) => {
      return Buffer.from(JSON.stringify(files[filePath] || {}), 'utf8');
    });

    spyOn(mockFs, 'writeJsonSync').and.callFake((filePath, contents) => {
      files[filePath] = files[filePath] || {};
      Object.assign(files[filePath], contents);
    });

    const processor = mock.reRequire(PROCESSOR_PATH);
    processor.prepareLocaleFiles();

    expect(files['.skypageslocales/resources_en_US.json']).toEqual({
      spa_key1: { _description: '', message: '[en_US] spa message 1' },
      spa_key2: { _description: '', message: '[en_US] spa message 2' },
      lib_key1: { _description: '', message: '[en_US] lib message 1' },
      lib_key2: { _description: '', message: '[en_US] lib message 2' },
      lib_internal_key1: { _description: '', message: '[en_US] lib internal message 1' },
      lib_internal_key2: { _description: '', message: '[en_US] lib internal message 2' }
    });

    expect(files['.skypageslocales/resources_fr_CA.json']).toEqual({
      spa_key1: { _description: '', message: '[fr_CA] spa message 1' },
      spa_key2: { _description: '', message: '[en_US] spa message 2' },
      spa_fr_key1: { _description: '', message: '[fr_CA] spa fr message' },
      lib_key1: { _description: '', message: '[en_US] lib message 1' },
      lib_key2: { _description: '', message: '[fr_CA] lib message 2' },
      lib_internal_key1: { _description: '', message: '[en_US] lib internal message 1' },
      lib_internal_key2: { _description: '', message: '[fr_CA] lib internal message 2' },
      lib_fr_key: { _description: '', message: '[fr_CA] lib fr message' },
      lib_internal_fr_key: { _description: '', message: '[fr_CA] lib internal fr message' }
    });

    expect(files['.skypageslocales/resources_en_CA.json']).toEqual({
      spa_key1: { _description: '', message: '[en_US] spa message 1' },
      spa_key2: { _description: '', message: '[en_US] spa message 2' },
      lib_key1: { _description: '', message: '[en_US] lib message 1' },
      lib_key2: { _description: '', message: '[en_US] lib message 2' },
      lib_internal_key1: { _description: '', message: '[en_US] lib internal message 1' },
      lib_internal_key2: { _description: '', message: '[en_US] lib internal message 2' },
      lib_internal_en_ca_key: { _description: '', message: '[en_CA] lib internal en_CA message' }
    });
  });

  it('should handle empty JSON files', () => {
    spyOn(mockGlob, 'sync').and.returnValue([
      '/src/assets/locales/resources_en_US.json'
    ]);

    spyOn(mockFs, 'readFileSync').and.returnValue(
      new Buffer('', 'utf8')
    );
    const writeSpy = spyOn(mockFs, 'writeJsonSync').and.callThrough();
    const processor = mock.reRequire(PROCESSOR_PATH);
    processor.prepareLocaleFiles();
    expect(writeSpy).toHaveBeenCalledWith(
      '.skypageslocales/resources_en_US.json',
      {}
    );
  });

  it('should remove temp files when the process exits', () => {
    const spy = spyOn(mockFs, 'removeSync').and.callThrough();
    mock.reRequire(PROCESSOR_PATH);
    triggerProcessOn('SIGINT');
    expect(spy).toHaveBeenCalledWith('.skypageslocales');
  });
});
