/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const logger = require('winston');

describe('SKY UX processor Webpack loader', () => {
  const skyPagesConfigUtil = '../config/sky-pages/sky-pages.config.js';
  const preloaderPath = '../loader/sky-processor/preload';
  const postloaderPath = '../loader/sky-processor/postload';
  const content = '<p>Hello, World!</p>';

  beforeEach(() => {
    // Clear `require` cache for main script
    Object.keys(require.cache).forEach(key => {
      if (key.includes('sky-processor/index')) {
        delete require.cache[key];
      }
    });
  });

  afterEach(() => {
    mock.stop(skyPagesConfigUtil);
    mock.stop('my-plugin');
  });
  
  it('should not alter the file contents if plugins not present', () => {
    mock(skyPagesConfigUtil, {
      getSkyPagesConfig: () => {
        return {
          foo: 'bar'
        };
      }
    });
    const loader = mock.reRequire(preloaderPath);
    const result = loader.apply({}, [content]);
    expect(result).toBe(content);
  });

  it('should handle invalid plugins', () => {
    spyOn(logger, 'info');
    mock(skyPagesConfigUtil, {
      getSkyPagesConfig: () => {
        return {
          plugins: ['nonexistent-plugin']
        };
      }
    });
    const loader = mock.reRequire(preloaderPath);
    loader.apply({}, ['']);
    expect(logger.info).toHaveBeenCalledWith(`Plugin not found: nonexistent-plugin`);
  });

  it('should pass file contents to the plugin to be altered', () => {
    mock('my-plugin', {
      preload: (content) => '<p></p>'
    });
    mock(skyPagesConfigUtil, {
      getSkyPagesConfig: () => {
        return {
          plugins: ['my-plugin']
        };
      }
    });
    const loader = mock.reRequire(preloaderPath);
    const result = loader.apply({}, [content]);
    expect(result).toBe('<p></p>');
  });

  it('should not alter the content if the plugin doesn\'t return anything', () => {
    mock('my-plugin', {
      preload: () => {}
    });
    mock(skyPagesConfigUtil, {
      getSkyPagesConfig: () => {
        return {
          plugins: ['my-plugin']
        };
      }
    });
    const loader = mock.reRequire(preloaderPath);
    const result = loader.apply({}, [content]);
    expect(result).toBe(content);
  });

  it('should not alter the content if the plugin\'s callbacks are invalid', () => {
    mock('my-plugin', {
      preload: 'foo'
    });
    mock(skyPagesConfigUtil, {
      getSkyPagesConfig: () => {
        return {
          plugins: ['my-plugin']
        };
      }
    });
    const loader = mock.reRequire(preloaderPath);
    const result = loader.apply({}, [content]);
    expect(result).toBe(content);
  });

  it('should pass file contents to the plugin to be altered after', () => {
    mock('my-plugin', {
      preload: (content) => '<p></p>',
      postload: (content) => content + '<br>'
    });
    mock(skyPagesConfigUtil, {
      getSkyPagesConfig: () => {
        return {
          plugins: ['my-plugin']
        };
      }
    });
    const preloader = mock.reRequire(preloaderPath);
    const postloader = mock.reRequire(postloaderPath);
    let result = preloader.apply({}, [content]);
    result = postloader.apply({}, [result]);
    expect(result).toBe('<p></p><br>');
  });

  it('should pass the resource path into the plugin', () => {
    mock('my-plugin', {
      postload: (content, resourcePath) => `<p>${resourcePath}</p>`
    });
    mock(skyPagesConfigUtil, {
      getSkyPagesConfig: () => {
        return {
          plugins: ['my-plugin']
        };
      }
    });
    const loader = mock.reRequire(postloaderPath);
    const config = {
      resourcePath: 'index.html'
    };
    const result = loader.apply(config, [content]);
    expect(result).toBe(`<p>${config.resourcePath}</p>`);
  });
});
