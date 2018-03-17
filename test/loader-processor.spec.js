/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const logger = require('@blackbaud/skyux-logger');

describe('SKY UX processor Webpack loader', () => {
  const preloaderPath = '../loader/sky-processor/preload';
  const postloaderPath = '../loader/sky-processor/postload';
  const content = '<p>Hello, World!</p>';
  let config;

  beforeEach(() => {
    config = {
      resourcePath: '',
      options: {
        skyPagesConfig: {
          skyux: {}
        }
      }
    };
  });

  afterEach(() => {
    mock.stop('my-plugin');
  });

  it('should not alter the file contents if plugins not present', () => {
    const loader = require(preloaderPath);
    const result = loader.call(config, content);
    expect(result).toBe(content);
  });

  it('should handle invalid plugins', () => {
    spyOn(logger, 'info');

    config.options.skyPagesConfig.skyux.plugins = ['nonexistent-plugin'];
    const loader = require(preloaderPath);
    loader.apply(config, ['']);

    expect(logger.info).toHaveBeenCalledWith(`Plugin not found: nonexistent-plugin`);
  });

  it('should pass file contents to the plugin to be altered', () => {
    mock('my-plugin', {
      preload: () => '<p></p>'
    });

    config.options.skyPagesConfig.skyux.plugins = ['my-plugin'];
    const loader = require(preloaderPath);
    const result = loader.call(config, content);

    expect(result).toBe('<p></p>');
  });

  it('should not alter the content if the plugin doesn\'t return anything', () => {
    mock('my-plugin', {
      preload: () => {}
    });

    config.options.skyPagesConfig.skyux.plugins = ['my-plugin'];
    const loader = require(preloaderPath);
    const result = loader.call(config, content);

    expect(result).toBe(content);
  });

  it('should not alter the content if the plugin\'s callbacks are invalid', () => {
    mock('my-plugin', {
      preload: 'foo'
    });

    config.options.skyPagesConfig.skyux.plugins = ['my-plugin'];
    const loader = require(preloaderPath);
    const result = loader.call(config, content);

    expect(result).toBe(content);
  });

  it('should pass file contents to the plugin to be altered after', () => {
    mock('my-plugin', {
      preload: () => '<p></p>',
      postload: (content) => content + '<br>'
    });

    config.options.skyPagesConfig.skyux.plugins = ['my-plugin'];
    const preloader = require(preloaderPath);
    const postloader = require(postloaderPath);

    let result = preloader.call(config, content);
    result = postloader.call(config, result);

    expect(result).toBe('<p></p><br>');
  });

  it('should pass the resource path into the plugin', () => {
    mock('my-plugin', {
      postload: (content, resourcePath) => `<p>${resourcePath}</p>`
    });

    config.options.skyPagesConfig.skyux.plugins = ['my-plugin'];
    const loader = require(postloaderPath);
    const result = loader.call(config, content);

    expect(result).toBe(`<p>${config.resourcePath}</p>`);
  });

  it('should pass skyPagesConfig into the plugin', () => {
    mock('my-plugin', {
      postload: (content, resourcePath, skyPagesConfig) => `<p>${skyPagesConfig.skyux.app.name}</p>`
    });

    config.options.skyPagesConfig.skyux.app = {
      name: 'My App'
    };
    config.options.skyPagesConfig.skyux.plugins = ['my-plugin'];
    const loader = require(postloaderPath);
    const result = loader.call(config, content);

    expect(result).toBe(`<p>${config.options.skyPagesConfig.skyux.app.name}</p>`);
  });

  it('should pass file contents to many plugins', () => {
    mock('my-plugin', {
      preload: () => '<p></p>'
    });
    mock('my-other-plugin', {
      preload: (content) => `${content}<br>`
    });

    config.options.skyPagesConfig.skyux.plugins = ['my-plugin', 'my-other-plugin'];
    const loader = require(preloaderPath);
    const result = loader.call(config, content);

    expect(result).toBe('<p></p><br>');
    mock.stop('my-other-plugin');
  });
});
