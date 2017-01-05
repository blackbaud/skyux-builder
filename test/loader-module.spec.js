/*jshint jasmine: true, node: true */
'use strict';

describe('SKY UX Builder Webpack module loader', () => {

  let loader;
  beforeEach(() => {
    loader = require('../loader/sky-pages-module/index');
  });

  it('should call the SKY UX Builder module generator', () => {
    const generator = require('../lib/sky-pages-module-generator');

    let getSourceSpy = spyOn(generator, 'getSource');

    const config = {
      options: {
        SKY_PAGES: {
          entries: []
        }
      }
    };

    loader.apply(config);

    expect(getSourceSpy).toHaveBeenCalledWith(config.options.SKY_PAGES);
  });
});
