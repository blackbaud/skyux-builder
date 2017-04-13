/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const logger = require('winston');

describe('SKY UX processor Webpack loader', () => {
  const preloaderPath = '../loader/sky-processor/preload';
  const postloaderPath = '../loader/sky-processor/postload';
  const content = '<p>Hello, World!</p>';
  let config;

  beforeEach(() => {
    config = {
      resourcePath: '',
      options: {
        skyAppConfig: {
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

    config.options.skyAppConfig.skyux.plugins = ['nonexistent-plugin'];
    const loader = require(preloaderPath);
    loader.apply(config, ['']);

    expect(logger.info).toHaveBeenCalledWith(`Plugin not found: nonexistent-plugin`);
  });

  it('should pass file contents to the plugin to be altered', () => {
    mock('my-plugin', {
      preload: (content) => '<p></p>'
    });

    config.options.skyAppConfig.skyux.plugins = ['my-plugin'];
    const loader = require(preloaderPath);
    const result = loader.call(config, content);

    expect(result).toBe('<p></p>');
  });

  it('should not alter the content if the plugin doesn\'t return anything', () => {
    mock('my-plugin', {
      preload: () => {}
    });

    config.options.skyAppConfig.skyux.plugins = ['my-plugin'];
    const loader = require(preloaderPath);
    const result = loader.call(config, content);

    expect(result).toBe(content);
  });

  it('should not alter the content if the plugin\'s callbacks are invalid', () => {
    mock('my-plugin', {
      preload: 'foo'
    });

    config.options.skyAppConfig.skyux.plugins = ['my-plugin'];
    const loader = require(preloaderPath);
    const result = loader.call(config, content);

    expect(result).toBe(content);
  });

  it('should pass file contents to the plugin to be altered after', () => {
    mock('my-plugin', {
      preload: (content) => '<p></p>',
      postload: (content) => content + '<br>'
    });

    config.options.skyAppConfig.skyux.plugins = ['my-plugin'];
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

    config.options.skyAppConfig.skyux.plugins = ['my-plugin'];
    const loader = require(postloaderPath);
    const result = loader.call(config, content);

    expect(result).toBe(`<p>${config.resourcePath}</p>`);
  });
});
