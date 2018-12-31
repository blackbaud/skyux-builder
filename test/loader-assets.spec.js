const mock = require('mock-require');

describe('SKY UX assets Webpack loader', () => {

  let loader;
  let mockLocaleProcessor;

  beforeEach(() => {
    mock('fs-extra', {
      readFileSync() {
        return 'zxcv';
      }
    });

    mock('hash-file', {
      sync() {
        return 'abcdefg';
      }
    });

    mock('loader-utils', {
      getOptions() {
        return {
          baseUrl: 'https://localhost:1234/base/'
        };
      }
    });

    mockLocaleProcessor = {
      isLocaleFile: () => false
    };
    mock('../lib/locale-assets-processor', mockLocaleProcessor);

    mock.reRequire('../lib/assets-processor');
    loader = mock.reRequire('../loader/sky-assets/index');
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should replace links to assets and emit the referenced files', () => {
    const html = `
<img src="~/assets/image.jpg">
<img src="~/assets/image2.jpg">
<img src="~/assets/image.3.jpg">
`;

    const config = {
      _compiler: {
        plugin() { }
      },
      options: {
        SKY_PAGES: {
          entries: []
        }
      },
      emitFile() { }
    };

    const emitFileSpy = spyOn(config, 'emitFile');

    const modifiedHtml = loader.apply(config, [html]);

    // Verify the referenced file is emitted to Webpack's output.
    expect(emitFileSpy.calls.count()).toBe(3);

    expect(emitFileSpy.calls.argsFor(0)).toEqual(['assets/image.abcdefg.jpg', 'zxcv']);
    expect(emitFileSpy.calls.argsFor(1)).toEqual(['assets/image2.abcdefg.jpg', 'zxcv']);
    expect(emitFileSpy.calls.argsFor(2)).toEqual(['assets/image.3.abcdefg.jpg', 'zxcv']);

    // Verify that the references were updated to include the base URL and hash.
    expect(modifiedHtml).toBe(`
<img src="https://localhost:1234/base/assets/image.abcdefg.jpg">
<img src="https://localhost:1234/base/assets/image2.abcdefg.jpg">
<img src="https://localhost:1234/base/assets/image.3.abcdefg.jpg">
`);
  });

});
