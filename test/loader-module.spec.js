describe('SKY UX Builder Webpack module loader', () => {

  let loader;
  beforeEach(() => {
    loader = require('../loader/sky-pages-module/index');
  });

  it('should call the SKY UX Builder module generator', () => {
    const generator = require('../lib/sky-pages-module-generator');

    let getSourceSpy = spyOn(generator, 'getSource');

    const config = {
      _compiler: {
        plugin: function () {}
      },
      options: {
        skyPagesConfig: {
          entries: []
        }
      }
    };

    loader.apply(config);

    expect(getSourceSpy).toHaveBeenCalledWith(config.options.skyPagesConfig);
  });

  it('should timestamp sky-pages.module.ts for HTML and TS updates', () => {

    const fs = require('fs');
    const generator = require('../lib/sky-pages-module-generator');

    spyOn(generator, 'getSource');
    spyOn(fs, 'writeFileSync');

    let callback;

    const config = {
      _compiler: {
        plugin: function (evt, cb) {
          callback = cb;
        }
      },
      options: {
        SKY_PAGES: {
          entries: []
        }
      }
    };

    loader.apply(config);
    callback('my-file.html');
    callback('sky-pages.module.ts');
    callback('my-file.ts');
    expect(fs.writeFileSync).toHaveBeenCalledTimes(2);

  });
});
